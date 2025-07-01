import client, { Counter, collectDefaultMetrics } from "prom-client";
import express from "express";

collectDefaultMetrics();
export const eventsProcessed = new Counter({
  name: "worker_events_processed_total",
  help: "Total events processed",
});
export const eventsFailed = new Counter({
  name: "worker_events_failed_total",
  help: "Total events failed",
});
export const batchInserts = new Counter({
  name: "worker_batch_inserts_total",
  help: "Total batch inserts",
});

export function setupMetricsServer(port = 8009) {
  const app = express();
  app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  });
  app.listen(port, () => {
    console.log(`Worker Prometheus metrics listening on port ${port}`);
  });
}
