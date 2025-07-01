import { pollSqs } from "./sqs";
import { bufferEvent } from "./db";
import { setupMetricsServer, eventsProcessed, eventsFailed } from "./metrics";

// Start Prometheus metrics server
setupMetricsServer();

// Main SQS poll loop
pollSqs(async (event) => {
  try {
    bufferEvent(event);
    eventsProcessed.inc();
  } catch (err) {
    eventsFailed.inc();
    console.error("[Worker] Failed to buffer event", err);
  }
});
