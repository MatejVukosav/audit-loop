import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { env } from '../config/config';

interface EventPayload {
  workspace_id: string;
  event_type: string;
  latency_ms: number;
  ai_spend_usd: number;
  timestamp: string;
}

const sqs: SQSClient = new SQSClient({
  region: env.AWS_REGION || 'eu-central-1',
  endpoint: env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

const queueUrl = env.SQS_QUEUE_URL || 'http://localhost:4566/000000000000/audit-events';

export async function sendEventToQueue(event: EventPayload): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(event),
    }),
  );
}
