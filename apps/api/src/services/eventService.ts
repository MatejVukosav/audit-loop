import { sendEventToQueue } from '../../../../packages/sqs';
import { getMetricsForWorkspace } from '../../../../packages/metrics';
import { env } from '../../../../packages/config/config';
import Redis from 'ioredis';
import { broadcast } from '../websocket';

const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379');
const METRICS_CACHE_TTL = 10; // seconds

export async function sendEventsToQueue(events: any[]) {
  for (const event of events) {
    await sendEventToQueue(event);
    await redis.del(`metrics:${event.workspace_id}`); // Invalidate cache
    broadcast('event', event);
  }
}

export async function getMetrics(workspace_id: string) {
  const cacheKey = `metrics:${workspace_id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  const metrics = await getMetricsForWorkspace(workspace_id);
  await redis.set(cacheKey, JSON.stringify(metrics), 'EX', METRICS_CACHE_TTL);
  broadcast('metrics', { workspace_id, metrics });
  return metrics;
}
