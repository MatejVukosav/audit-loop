import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

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

export async function sendEventToQueue(event: EventPayload): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(event),
    })
  );
}
