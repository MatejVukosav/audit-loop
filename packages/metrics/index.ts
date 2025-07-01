import { query } from "@audit-loop/db";

interface MetricsResult {
  p95_latency_ms: number;
  total_spend_usd: number;
}

interface LatencyRow {
  p95: number | null;
}

interface SpendRow {
  total_spend: string | null;
}

export async function getMetricsForWorkspace(
  workspace_id: string
): Promise<MetricsResult> {
  // 95th percentile latency
  const latencyRes: { rows: LatencyRow[] } = await query<LatencyRow>(
    `
    SELECT percentile_disc(0.95) WITHIN GROUP (ORDER BY latency_ms) AS p95
    FROM events
    WHERE workspace_id = $1 AND timestamp > NOW() - INTERVAL '60 minutes'
  `,
    [workspace_id]
  );

  // Total spend
  const spendRes: { rows: SpendRow[] } = await query<SpendRow>(
    `
    SELECT SUM(ai_spend_usd) AS total_spend
    FROM events
    WHERE workspace_id = $1 AND timestamp > NOW() - INTERVAL '60 minutes'
  `,
    [workspace_id]
  );

  return {
    p95_latency_ms: latencyRes.rows[0]?.p95 || 0,
    total_spend_usd: parseFloat(spendRes.rows[0]?.total_spend || "0"),
  };
}
