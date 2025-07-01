import { query as pgQuery } from '../../../packages/db';
import { getMetricsForWorkspace } from '../../../packages/metrics';
import { EventPayload } from './types';
import { pushSlackAlert } from './slack';
import { env } from '../../../packages/config/config';

export const query = pgQuery;

function buildBatchInsertPlaceholders(batchSize: number, fieldsPerRow: number): string {
  return Array.from({ length: batchSize }, (_, row) => {
    const base = row * fieldsPerRow;
    const placeholders = Array.from({ length: fieldsPerRow }, (_, col) => `$${base + col + 1}`);
    return `(${placeholders.join(', ')})`;
  }).join(', ');
}

const BATCH_SIZE = 100;
const BATCH_INTERVAL_MS = 1000;
let eventBuffer: EventPayload[] = [];
let bufferTimer: NodeJS.Timeout | null = null;

const SLACK_WEBHOOK_URL: string = env.SLACK_WEBHOOK_URL || '';

export async function flushEventBuffer() {
  if (eventBuffer.length === 0) return;
  const batch = eventBuffer;
  eventBuffer = [];
  try {
    console.log(`[DB] Flushing ${batch.length} events to database...`);
    const fieldsPerRow = 5;
    const placeholders = buildBatchInsertPlaceholders(batch.length, fieldsPerRow);
    const values = batch.flatMap((e) => [
      e.workspace_id,
      e.event_type,
      e.latency_ms,
      e.ai_spend_usd,
      e.timestamp,
    ]);
    await query(
      `INSERT INTO events (workspace_id, event_type, latency_ms, ai_spend_usd, timestamp)
       VALUES ${placeholders}`,
      values,
    );
    // eslint-disable-next-line no-console
    console.log(`[DB] Inserted batch of ${batch.length} events`);
    for (const event of batch) {
      checkBudgetAndAlert(event.workspace_id);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[DB] Failed to insert batch', err);
    // Optionally: re-buffer or dead-letter
  }
}

export function bufferEvent(event: EventPayload) {
  console.log(`[DB] Buffering event for workspace: ${event.workspace_id}`);
  eventBuffer.push(event);
  console.log(`[DB] Buffer size: ${eventBuffer.length}`);
  if (eventBuffer.length >= BATCH_SIZE) {
    if (bufferTimer) clearTimeout(bufferTimer);
    console.log('[DB] Buffer full, flushing immediately');
    flushEventBuffer();
  } else if (!bufferTimer) {
    console.log('[DB] Setting buffer timer for 1 second');
    bufferTimer = setTimeout(() => {
      console.log('[DB] Buffer timer expired, flushing');
      flushEventBuffer();
      bufferTimer = null;
    }, BATCH_INTERVAL_MS);
  }
}

export async function checkBudgetAndAlert(workspace_id: string) {
  if (!SLACK_WEBHOOK_URL) return;
  try {
    const metrics = await getMetricsForWorkspace(workspace_id);
    if (metrics.total_spend_usd > 10) {
      const now = new Date();
      const { rows } = await query('SELECT last_alert FROM budget_alerts WHERE workspace_id = $1', [
        workspace_id,
      ]);
      const lastAlert = rows[0]?.last_alert ? new Date(rows[0].last_alert) : null;
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (!lastAlert || lastAlert < oneHourAgo) {
        pushSlackAlert(workspace_id);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Budget] Failed to check budget/alert', err);
  }
}
