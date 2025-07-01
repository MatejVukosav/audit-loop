import React, { useEffect, useState, useRef } from "react";
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
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch all workspaces on mount
  useEffect(() => {
    fetch("http://localhost:8009/workspaces")
      .then((res) => res.json())
      .then((ws) => {
        setWorkspaces(ws);
        if (ws.length && !selectedWorkspace) setSelectedWorkspace(ws[0]);
      });
  }, []);

  // WebSocket for live metrics
  useEffect(() => {
    if (!selectedWorkspace) return;
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    const connect = () => {
      ws = new window.WebSocket("ws://localhost:8009");
      wsRef.current = ws;
      ws.onopen = () => {
        // Optionally: send a hello message
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "metrics" && msg.payload.workspace_id === selectedWorkspace) {
            setMetrics(msg.payload.metrics);
            setLastUpdated(new Date());
            setError(null);
          }
        } catch {}
      };
      ws.onerror = () => {
        ws?.close();
      };
      ws.onclose = () => {
        // Fallback to polling if WebSocket closes
        fallbackInterval = setInterval(fetchMetrics, 5000);
      };
    };
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
        setError(
          err instanceof Error ? err.message : "Failed to fetch metrics"
        );
      }
    };
    try {
      connect();
    } catch {
      fallbackInterval = setInterval(fetchMetrics, 5000);
    }
    return () => {
      wsRef.current?.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [selectedWorkspace]);

  // Fallback polling if metrics are not updated by WebSocket
  useEffect(() => {
    if (!selectedWorkspace || metrics) return;
    const interval = setInterval(() => {
      fetch(`http://localhost:8009/metrics?workspace_id=${selectedWorkspace}`)
        .then((res) => res.json())
        .then((data: Metrics) => {
          setMetrics(data);
          setLastUpdated(new Date());
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedWorkspace, metrics]);

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
