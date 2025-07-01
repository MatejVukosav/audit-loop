import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sendEventToQueue } from "../../packages/sqs";
import { getMetricsForWorkspace } from "../../packages/metrics";
import Redis from "ioredis";
import { WebSocketServer } from "ws";
import client, { Counter, Gauge, collectDefaultMetrics } from "prom-client";
import http from "http";

interface EventPayload {
  workspace_id: string;
  event_type: string;
  latency_ms: number;
  ai_spend_usd: number;
  timestamp: string;
}

interface MetricsResponse {
  p95_latency_ms: number;
  total_spend_usd: number;
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Redis distributed cache ---
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// --- WebSocket server ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const wsClients = new Set<any>();
wss.on("connection", (ws: import("ws").WebSocket) => {
  wsClients.add(ws);
  ws.on("close", () => wsClients.delete(ws));
});
function broadcast(type: string, payload: any) {
  const msg = JSON.stringify({ type, payload });
  for (const ws of wsClients) {
    try {
      ws.send(msg);
    } catch {}
  }
}

// --- Prometheus metrics ---
collectDefaultMetrics();
const eventsReceived = new Counter({
  name: "api_events_received_total",
  help: "Total events received",
});
const eventsQueued = new Counter({
  name: "api_events_queued_total",
  help: "Total events queued to SQS",
});
const metricsCacheHits = new Counter({
  name: "api_metrics_cache_hits_total",
  help: "Metrics cache hits",
});
const metricsCacheMisses = new Counter({
  name: "api_metrics_cache_misses_total",
  help: "Metrics cache misses",
});

// --- In-memory SQS send queue ---
const sqsQueue: EventPayload[] = [];
let isProcessing = false;
async function processSqsQueue() {
  if (isProcessing) return;
  isProcessing = true;
  while (sqsQueue.length > 0) {
    const event = sqsQueue.shift();
    if (!event) continue;
    try {
      await sendEventToQueue(event);
      eventsQueued.inc();
      broadcast("event", event);
      // Invalidate Redis cache for workspace
      await redis.del(`metrics:${event.workspace_id}`);
    } catch (err) {
      console.error("[SQS] Failed to enqueue event", err);
    }
  }
  isProcessing = false;
}

// --- /events endpoint: supports single or batch ---
app.post(
  "/events",
  async (
    req: Request<{}, {}, EventPayload | EventPayload[]>,
    res: Response
  ): Promise<Response> => {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    for (const event of events) {
      const { workspace_id, event_type, latency_ms, ai_spend_usd, timestamp } =
        event;
      if (
        !workspace_id ||
        !event_type ||
        typeof latency_ms !== "number" ||
        typeof ai_spend_usd !== "number" ||
        !timestamp
      ) {
        return res.status(400).json({ error: "Invalid event payload" });
      }
      sqsQueue.push(event);
      eventsReceived.inc();
    }
    processSqsQueue(); // fire-and-forget
    return res.status(202).json({ status: "queued", count: events.length });
  }
);

// --- Redis metrics cache ---
const METRICS_CACHE_TTL = 10; // seconds

app.get(
  "/metrics",
  async (
    req: Request<{}, {}, {}, { workspace_id?: string }>,
    res: Response
  ): Promise<Response> => {
    // Prometheus scrape endpoint
    if (Object.keys(req.query).length === 0) {
      res.set("Content-Type", client.register.contentType);
      return res.end(await client.register.metrics());
    }
    const { workspace_id }: { workspace_id?: string } = req.query;
    if (!workspace_id || typeof workspace_id !== "string") {
      return res.status(400).json({ error: "workspace_id required" });
    }
    const cacheKey = `metrics:${workspace_id}`;
    let metrics: MetricsResponse | null = null;
    const cached = await redis.get(cacheKey);
    if (cached) {
      metrics = JSON.parse(cached);
      metricsCacheHits.inc();
    } else {
      metrics = await getMetricsForWorkspace(workspace_id);
      await redis.set(
        cacheKey,
        JSON.stringify(metrics),
        "EX",
        METRICS_CACHE_TTL
      );
      metricsCacheMisses.inc();
      // Broadcast metrics update
      broadcast("metrics", { workspace_id, metrics });
    }
    return res.json(metrics);
  }
);

app.get("/workspaces", async (req, res) => {
  try {
    const { query } = require("../../packages/db");
    const { rows } = await query(
      "SELECT DISTINCT workspace_id FROM events ORDER BY workspace_id"
    );
    res.json(rows.map((r: any) => r.workspace_id));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

const PORT: string | number = process.env.PORT || 8009;
server.listen(PORT, (): void => {
  console.log(
    `Events API (with WebSocket/Prometheus) listening on port ${PORT}`
  );
});
