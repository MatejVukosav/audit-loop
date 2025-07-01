console.log('[Worker] Starting worker...');

console.log('[Worker] Importing modules...');
import { pollSqs } from './sqs';
console.log('[Worker] SQS module imported');

import { bufferEvent, flushEventBuffer } from './db';
console.log('[Worker] DB module imported');

import { setupMetricsServer, eventsProcessed, eventsFailed } from './metrics';
console.log('[Worker] Metrics module imported');

// Start Prometheus metrics server
console.log('[Worker] Setting up metrics server...');
setupMetricsServer();
console.log('[Worker] Metrics server setup complete');

console.log('[Worker] Starting SQS polling...');

// Main SQS poll loop
console.log('[Worker] About to start SQS polling...');
pollSqs(async (event) => {
  try {
    console.log('[Worker] Processing event:', event.workspace_id, event.event_type);
    bufferEvent(event);
    eventsProcessed.inc();
    console.log('[Worker] Event buffered successfully');
  } catch (err) {
    eventsFailed.inc();
    // eslint-disable-next-line no-console
    console.error('[Worker] Failed to buffer event', err);
  }
}).catch((err) => {
  console.error('[Worker] SQS polling failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  // eslint-disable-next-line no-console
  console.log('Shutting down worker...');
  await flushEventBuffer();
  process.exit(0);
});
process.on('SIGINT', async () => {
  // eslint-disable-next-line no-console
  console.log('Shutting down worker...');
  await flushEventBuffer();
  process.exit(0);
});
