import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Header } from "./components/Header";
import { WorkspaceInfo } from "./components/WorkspaceInfo";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { MetricsGrid } from "./components/MetricsGrid";
import { LoadingState } from "./components/LoadingState";
import { Footer } from "./components/Footer";

interface Metrics {
  p95_latency_ms: number;
  total_spend_usd: number;
}

function Dashboard() {
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch all workspaces on mount
  useEffect(() => {
    fetch("http://localhost:8009/workspaces")
      .then((res) => res.json())
      .then((ws) => {
        setWorkspaces(ws);
        if (ws.length && !selectedWorkspace) setSelectedWorkspace(ws[0]);
      });
  }, []);

  // Fetch metrics for selected workspace
  useEffect(() => {
    if (!selectedWorkspace) return;
    const fetchMetrics = async () => {
      try {
        const res = await fetch(
          `http://localhost:8009/metrics?workspace_id=${selectedWorkspace}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Metrics = await res.json();
        setMetrics(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch metrics"
        );
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, [selectedWorkspace]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          title="🚀 Audit Loop Dashboard"
          subtitle="Real-time monitoring for AI performance and costs"
        />

        {workspaces.length > 0 && (
          <div className="mb-6">
            <label className="mr-2 text-white font-semibold">Workspace:</label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="p-2 rounded border"
            >
              {workspaces.map((ws) => (
                <option key={ws} value={ws}>
                  {ws}
                </option>
              ))}
            </select>
          </div>
        )}

        <WorkspaceInfo
          workspaceId={selectedWorkspace}
          lastUpdated={lastUpdated}
        />

        {error && <ErrorDisplay error={error} />}

        {metrics ? <MetricsGrid metrics={metrics} /> : <LoadingState />}

        <Footer />
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Dashboard />);
