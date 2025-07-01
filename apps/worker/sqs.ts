import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { EventPayload } from "./types";

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

export async function pollSqs(onEvent: (event: EventPayload) => Promise<void>) {
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
          const event = JSON.parse(msg.Body!) as EventPayload;
          await onEvent(event);
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: QUEUE_URL,
              ReceiptHandle: msg.ReceiptHandle!,
            })
          );
        } catch (err) {
          console.error("[SQS] Failed to process event", err);
        }
      }
    }
  }
}
