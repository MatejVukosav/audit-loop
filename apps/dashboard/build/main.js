"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
require("./index.css");
const Header_1 = require("./components/Header");
const WorkspaceInfo_1 = require("./components/WorkspaceInfo");
const ErrorDisplay_1 = require("./components/ErrorDisplay");
const MetricsGrid_1 = require("./components/MetricsGrid");
const LoadingState_1 = require("./components/LoadingState");
const Footer_1 = require("./components/Footer");
function Dashboard() {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [lastUpdated, setLastUpdated] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch("http://localhost:8009/metrics?workspace_id=demo");
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                setMetrics(data);
                setLastUpdated(new Date());
                setError(null);
            }
            catch (err) {
                console.error("Failed to fetch metrics:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch metrics");
            }
        };
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000);
        return () => clearInterval(interval);
    }, []);
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 font-sans text-gray-900", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [(0, jsx_runtime_1.jsx)(Header_1.Header, { title: "\uD83D\uDE80 Audit Loop Dashboard", subtitle: "Real-time monitoring for AI performance and costs" }), (0, jsx_runtime_1.jsx)(WorkspaceInfo_1.WorkspaceInfo, { workspaceId: "demo", lastUpdated: lastUpdated }), error && (0, jsx_runtime_1.jsx)(ErrorDisplay_1.ErrorDisplay, { error: error }), metrics ? (0, jsx_runtime_1.jsx)(MetricsGrid_1.MetricsGrid, { metrics: metrics }) : (0, jsx_runtime_1.jsx)(LoadingState_1.LoadingState, {}), (0, jsx_runtime_1.jsx)(Footer_1.Footer, {})] }) }));
}
const root = (0, client_1.createRoot)(document.getElementById("root"));
root.render((0, jsx_runtime_1.jsx)(Dashboard, {}));
