import { query as pgQuery } from "../../packages/db";
import { getMetricsForWorkspace } from "../../packages/metrics";
import { EventPayload } from "./types";
import { pushSlackAlert } from "./slack";

export const query = pgQuery;

// --- Helper for batch insert placeholders ---
function buildBatchInsertPlaceholders(
  batchSize: number,
  fieldsPerRow: number
): string {
  return Array.from({ length: batchSize }, (_, row) => {
    const base = row * fieldsPerRow;
    const placeholders = Array.from(
      { length: fieldsPerRow },
      (_, col) => `$${base + col + 1}`
    );
    return `(${placeholders.join(", ")})`;
  }).join(", ");
}

const BATCH_SIZE = 100;
const BATCH_INTERVAL_MS = 1000;
let eventBuffer: EventPayload[] = [];
let bufferTimer: NodeJS.Timeout | null = null;

export async function flushEventBuffer() {
  if (eventBuffer.length === 0) return;
  const batch = eventBuffer;
  eventBuffer = [];
  try {
    const fieldsPerRow = 5;
    const placeholders = buildBatchInsertPlaceholders(
      batch.length,
      fieldsPerRow
    );
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
      values
    );
    console.log(`[DB] Inserted batch of ${batch.length} events`);
    for (const event of batch) {
      checkBudgetAndAlert(event.workspace_id);
    }
  } catch (err) {
    console.error("[DB] Failed to insert batch", err);
    // Optionally: re-buffer or dead-letter
  }
}

export function bufferEvent(event: EventPayload) {
  eventBuffer.push(event);
  if (eventBuffer.length >= BATCH_SIZE) {
    if (bufferTimer) clearTimeout(bufferTimer);
    flushEventBuffer();
  } else if (!bufferTimer) {
    bufferTimer = setTimeout(() => {
      flushEventBuffer();
      bufferTimer = null;
    }, BATCH_INTERVAL_MS);
  }
}

export async function checkBudgetAndAlert(workspace_id: string) {
  const SLACK_WEBHOOK_URL: string = process.env.SLACK_WEBHOOK_URL || "";
  if (!SLACK_WEBHOOK_URL) return;
  try {
    const metrics = await getMetricsForWorkspace(workspace_id);
    if (metrics.total_spend_usd > 10) {
      const now = new Date();
      const { rows } = await query(
        "SELECT last_alert FROM budget_alerts WHERE workspace_id = $1",
        [workspace_id]
      );
      const lastAlert = rows[0]?.last_alert
        ? new Date(rows[0].last_alert)
        : null;
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (!lastAlert || lastAlert < oneHourAgo) {
        pushSlackAlert(workspace_id);
      }
    }
  } catch (err) {
    console.error("[Budget] Failed to check budget/alert", err);
  }
}
