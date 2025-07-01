import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from "@aws-sdk/client-sqs";
import { query } from "../../packages/db";
import { getMetricsForWorkspace } from "../../packages/metrics";
import axios from "axios";

interface EventPayload {
  workspace_id: string;
  event_type: string;
  latency_ms: number;
  ai_spend_usd: number;
  timestamp: string;
}

const sqs: SQSClient = new SQSClient({
  region: "eu-central-1",
  endpoint: process.env.SQS_ENDPOINT || "http://localhost:4566",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
});
const QUEUE_URL: string =
  process.env.SQS_QUEUE_URL ||
  "http://localhost:4566/000000000000/audit-events";
const SLACK_WEBHOOK_URL: string =
  process.env.SLACK_WEBHOOK_URL || "";

async function processEvent(event: EventPayload): Promise<void> {
  const {
    workspace_id,
    event_type,
    latency_ms,
    ai_spend_usd,
    timestamp,
  }: EventPayload = event;
  await query(
    "INSERT INTO events (workspace_id, event_type, latency_ms, ai_spend_usd, timestamp) VALUES ($1, $2, $3, $4, $5)",
    [workspace_id, event_type, latency_ms, ai_spend_usd, timestamp]
  );
  const metrics = await getMetricsForWorkspace(workspace_id);
  if (metrics.total_spend_usd > 10 && SLACK_WEBHOOK_URL) {
    // Check last alert time
    const now = new Date();
    const { rows } = await query(
      "SELECT last_alert FROM budget_alerts WHERE workspace_id = $1",
      [workspace_id]
    );
    const lastAlert = rows[0]?.last_alert ? new Date(rows[0].last_alert) : null;
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (!lastAlert || lastAlert < oneHourAgo) {
      await axios.post(SLACK_WEBHOOK_URL, {
        text: `Workspace ${workspace_id} spent $${metrics.total_spend_usd.toFixed(
          2
        )} in the last hour!`,
      });
      await query(
        `INSERT INTO budget_alerts (workspace_id, last_alert)
         VALUES ($1, $2)
         ON CONFLICT (workspace_id) DO UPDATE SET last_alert = EXCLUDED.last_alert`,
        [workspace_id, now]
      );
    }
  }
}

async function poll(): Promise<void> {
  while (true) {
    const res = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 10,
      })
    );
    if (res.Messages) {
      for (const msg of res.Messages) {
        try {
          await processEvent(JSON.parse(msg.Body!) as EventPayload);
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: msg.ReceiptHandle!,
            })
          );
        } catch (err: unknown) {
          console.error("Failed to process event", err);
        }
      }
    }
  }
}

poll();
