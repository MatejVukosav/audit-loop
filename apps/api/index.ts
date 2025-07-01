import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { sendEventToQueue } from "../../packages/sqs";
import { getMetricsForWorkspace } from "../../packages/metrics";

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

app.post(
  "/events",
  async (
    req: Request<{}, {}, EventPayload>,
    res: Response
  ): Promise<Response> => {
    const {
      workspace_id,
      event_type,
      latency_ms,
      ai_spend_usd,
      timestamp,
    }: EventPayload = req.body;
    if (
      !workspace_id ||
      !event_type ||
      typeof latency_ms !== "number" ||
      typeof ai_spend_usd !== "number" ||
      !timestamp
    ) {
      return res.status(400).json({ error: "Invalid event payload" });
    }
    try {
      await sendEventToQueue(req.body);
    } catch (err: unknown) {
      return res.status(500).json({ error: "Failed to queue event" });
    }
    return res.status(202).json({ status: "queued" });
  }
);

app.get(
  "/metrics",
  async (
    req: Request<{}, {}, {}, { workspace_id?: string }>,
    res: Response
  ): Promise<Response> => {
    const { workspace_id }: { workspace_id?: string } = req.query;
    if (!workspace_id || typeof workspace_id !== "string") {
      return res.status(400).json({ error: "workspace_id required" });
    }
    const metrics: MetricsResponse = await getMetricsForWorkspace(workspace_id);
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
app.listen(PORT, (): void => {
  console.log(`Events API listening on port ${PORT}`);
});
