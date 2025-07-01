import React from "react";
import { MetricCard } from "./MetricCard";

interface Metrics {
  p95_latency_ms: number;
  total_spend_usd: number;
}

interface MetricsGridProps {
  metrics: Metrics;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const getLatencyStatus = (latency: number) => {
    if (latency < 100) return "🟢 Excellent";
    if (latency < 300) return "🟡 Good";
    return "🔴 Needs attention";
  };

  const getSpendStatus = (spend: number) => {
    if (spend < 5) return "🟢 Low cost";
    if (spend < 10) return "🟡 Moderate";
    return "🔴 High cost";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <MetricCard
        icon="⚡"
        title="Latency (95th Percentile)"
        subtitle="Last 60 minutes"
        value={`${metrics.p95_latency_ms}ms`}
        status={getLatencyStatus(metrics.p95_latency_ms)}
        gradientColors="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      <MetricCard
        icon="💰"
        title="AI Spend"
        subtitle="Last 60 minutes"
        value={`$${metrics.total_spend_usd.toFixed(2)}`}
        status={getSpendStatus(metrics.total_spend_usd)}
        gradientColors="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      />
    </div>
  );
};
