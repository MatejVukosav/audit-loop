import { pollSqs } from './sqs';
import { bufferEvent, flushEventBuffer } from './db';
import { setupMetricsServer, eventsProcessed, eventsFailed } from './metrics';

setupMetricsServer();

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
