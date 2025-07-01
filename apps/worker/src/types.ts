export interface EventPayload {
  workspace_id: string;
  event_type: string;
  latency_ms: number;
  ai_spend_usd: number;
  timestamp: string;
}
