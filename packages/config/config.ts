import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AWS_REGION: z.string().default('eu-central-1'),
  AWS_ENDPOINT_URL: z.string().url().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  SQS_QUEUE_URL: z.string().url().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  PORT: z.string().optional(),
  METRICS_PORT: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
export {};
