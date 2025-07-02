import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { EventPayload } from './types';
import { env } from '../../../packages/config/config';

const sqs: SQSClient = new SQSClient({
  region: env.AWS_REGION || 'eu-central-1',
  endpoint: env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});
const QUEUE_URL: string = env.SQS_QUEUE_URL || 'http://localstack:4566/000000000000/audit-events';

export async function pollSqs(onEvent: (event: EventPayload) => Promise<void>) {
  console.log('[SQS] Starting polling loop for queue:', QUEUE_URL);
  while (true) {
    try {
      console.log('[SQS] Polling for messages...');
      const res = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 10,
        }),
      );
      console.log('[SQS] Received response, messages:', res.Messages?.length || 0);
      if (res.Messages && res.Messages.length > 0) {
        console.log('[SQS] Processing', res.Messages.length, 'messages');
        for (const msg of res.Messages) {
          try {
            const event = JSON.parse(msg.Body!) as EventPayload;
            console.log('[SQS] Processing event:', event.workspace_id, event.event_type);
            await onEvent(event);
            await sqs.send(
              new DeleteMessageCommand({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: msg.ReceiptHandle!,
              }),
            );
            console.log('[SQS] Event processed and deleted from queue');
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error('[SQS] Failed to process event', err);
          }
        }
      } else {
        console.log('[SQS] No messages received, continuing...');
      }
    } catch (err) {
      console.error('[SQS] Error in polling loop:', err);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}
