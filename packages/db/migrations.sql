CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  ai_spend_usd NUMERIC(10, 4) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL
);

-- Recommended indexes for high-volume event ingestion and fast metrics queries
CREATE INDEX IF NOT EXISTS idx_events_workspace_id ON events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_workspace_time ON events(workspace_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- For very large tables, consider partitioning by day or workspace:
-- Example:
-- CREATE TABLE events_y2024m07 PARTITION OF events FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE IF NOT EXISTS budget_alerts (
  workspace_id TEXT PRIMARY KEY,
  last_alert TIMESTAMPTZ NOT NULL
);