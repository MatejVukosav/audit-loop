import axios from 'axios';
import { getMetricsForWorkspace } from '../../../packages/metrics';
import { query } from './db';
import { env } from '../../../packages/config/config';

const SLACK_WEBHOOK_URL: string = env.SLACK_WEBHOOK_URL || '';
const slackQueue: string[] = [];
let slackProcessing = false;

export function pushSlackAlert(workspace_id: string) {
  slackQueue.push(workspace_id);
  processSlackQueue();
}

export async function processSlackQueue() {
  if (slackProcessing) return;
  slackProcessing = true;
  while (slackQueue.length > 0) {
    const workspace_id = slackQueue.shift();
    if (!workspace_id) continue;
    try {
      const metrics = await getMetricsForWorkspace(workspace_id);
      if (metrics.total_spend_usd < 10) continue;
      await axios.post(SLACK_WEBHOOK_URL, {
        text: `Workspace ${workspace_id} spent $${metrics.total_spend_usd.toFixed(2)} in the last hour!`,
      });
      const now = new Date();
      await query(
        `INSERT INTO budget_alerts (workspace_id, last_alert)
         VALUES ($1, $2)
         ON CONFLICT (workspace_id) DO UPDATE SET last_alert = EXCLUDED.last_alert`,
        [workspace_id, now],
      );
      // eslint-disable-next-line no-console
      console.log(`[Slack] Alert sent for workspace ${workspace_id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Slack] Failed to send alert', err);
    }
  }
  slackProcessing = false;
}
