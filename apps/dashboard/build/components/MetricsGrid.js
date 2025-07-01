"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsGrid = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const MetricCard_1 = require("./MetricCard");
const MetricsGrid = ({ metrics }) => {
    const getLatencyStatus = (latency) => {
        if (latency < 100)
            return "🟢 Excellent";
        if (latency < 300)
            return "🟡 Good";
        return "🔴 Needs attention";
    };
    const getSpendStatus = (spend) => {
        if (spend < 5)
            return "🟢 Low cost";
        if (spend < 10)
            return "🟡 Moderate";
        return "🔴 High cost";
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12", children: [(0, jsx_runtime_1.jsx)(MetricCard_1.MetricCard, { icon: "\u26A1", title: "Latency (95th Percentile)", subtitle: "Last 60 minutes", value: `${metrics.p95_latency_ms}ms`, status: getLatencyStatus(metrics.p95_latency_ms), gradientColors: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }), (0, jsx_runtime_1.jsx)(MetricCard_1.MetricCard, { icon: "\uD83D\uDCB0", title: "AI Spend", subtitle: "Last 60 minutes", value: `$${metrics.total_spend_usd.toFixed(2)}`, status: getSpendStatus(metrics.total_spend_usd), gradientColors: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" })] }));
};
exports.MetricsGrid = MetricsGrid;
