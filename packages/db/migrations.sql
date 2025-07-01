CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  ai_spend_usd NUMERIC(10, 4) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS budget_alerts (
  workspace_id TEXT PRIMARY KEY,
  last_alert TIMESTAMPTZ NOT NULL
);