import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { Header } from './../components/Header';
import { WorkspaceInfo } from './../components/WorkspaceInfo';
import { ErrorDisplay } from './../components/ErrorDisplay';
import { MetricsGrid } from './../components/MetricsGrid';
import { LoadingState } from './../components/LoadingState';
import { Footer } from './../components/Footer';
import { Toast } from './../components/Toast';
import { fetchWorkspaces, sendEvent } from './api';
import { useLiveMetrics } from './hooks/useLiveMetrics';

function Dashboard() {
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [firing, setFiring] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [testWorkspace, setTestWorkspace] = useState<string>('');

  useEffect(() => {
    fetchWorkspaces()
      .then((ws) => {
        setWorkspaces(ws);
        if (ws.length && !selectedWorkspace) setSelectedWorkspace(ws[0]);
        setFetchError(null);
      })
      .catch(() => {
        setFetchError('Failed to fetch workspaces. Please check your API connection.');
      });
  }, []);

  const { metrics, error, lastUpdated } = useLiveMetrics(selectedWorkspace);

  const fireTestEvents = async () => {
    const workspaceId = testWorkspace.trim() || 'demo';
    setFiring(true);
    //for loader
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate 5 random events
    const now = new Date();
    const events = Array.from({ length: 5 }).map(() => ({
      workspace_id: workspaceId,
      event_type: 'test',
      latency_ms: Math.floor(Math.random() * 500),
      ai_spend_usd: +(Math.random() * 10).toFixed(2),
      timestamp: new Date(now.getTime() - Math.floor(Math.random() * 3600 * 1000)).toISOString(),
    }));
    try {
      await sendEvent(events);
      setToast({
        message: `5 test events fired for workspace "${workspaceId}"!`,
        type: 'success',
        isVisible: true,
      });
    } catch {
      setToast({
        message: 'Failed to fire test events',
        type: 'error',
        isVisible: true,
      });
    }
    setFiring(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Header
          title="🚀 Audit Loop Dashboard"
          subtitle="Real-time monitoring for AI performance and costs"
        />

        {fetchError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {fetchError}
          </div>
        )}

        <div className="mb-10 flex flex-col items-center justify-center">
          <label className="mb-2 text-white font-semibold text-lg">Fire Test Events</label>
          <div className="flex items-center gap-2 w-full max-w-xl">
            <input
              type="text"
              placeholder="Workspace for events (default: demo)"
              value={testWorkspace}
              onChange={(e) => setTestWorkspace(e.target.value)}
              className="p-2 rounded border flex-1 bg-white text-gray-900 placeholder-gray-500 placeholder:font-normal"
              style={{ minWidth: 320, paddingLeft: 12, paddingRight: 12 }}
            />
            <button
              className="px-4 py-2 rounded bg-green-600 text-white font-bold hover:bg-green-700 transition disabled:opacity-50"
              onClick={fireTestEvents}
              disabled={firing}
            >
              {firing ? 'Firing...' : 'Fire Test Events'}
            </button>
          </div>
        </div>

        {workspaces.length === 0 && !fetchError && (
          <div className="mb-8 p-8 bg-white/90 rounded-3xl text-center shadow-xl border border-white/30">
            <div className="text-5xl mb-4">🗂️</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No workspaces found</h3>
            <p className="text-gray-500 font-medium">
              There are no workspaces available yet. Fire test events to create one!
            </p>
          </div>
        )}

        {workspaces.length > 0 && (
          <div className="mb-6 flex items-center gap-4">
            <div>
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
          </div>
        )}

        <WorkspaceInfo workspaceId={selectedWorkspace} lastUpdated={lastUpdated} />

        {error && <ErrorDisplay error={error} />}

        {/* No metrics message */}
        {(!selectedWorkspace || !metrics) && !error ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-2xl border border-white/30 mb-8">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No metrics found</h3>
            <p className="text-lg text-gray-500 font-medium">
              There are no metrics for this workspace in the last 60 minutes. Fire test events to
              generate some!
            </p>
          </div>
        ) : metrics && metrics.p95_latency_ms === 0 && metrics.total_spend_usd === 0 && !error ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-16 text-center shadow-2xl border border-white/30 mb-8">
            <div className="text-6xl mb-6">📭</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No metrics found</h3>
            <p className="text-lg text-gray-500 font-medium">
              There are no metrics for this workspace in the last 60 minutes. Fire test events to
              generate some!
            </p>
          </div>
        ) : metrics ? (
          <MetricsGrid metrics={metrics} />
        ) : (
          <LoadingState />
        )}

        <Footer />
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Dashboard />);
