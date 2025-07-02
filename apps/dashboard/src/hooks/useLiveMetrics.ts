import { useState, useCallback, useEffect } from 'react';
import { fetchMetrics } from '../api';
import { useWebSocket } from './useWebSocket';
import type { Metrics } from '../types';

const WS_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:8009'
).replace(/^http/, 'ws');

const PLACEHOLDER_METRICS: Metrics = {
  p95_latency_ms: 0,
  total_spend_usd: 0,
};

export function useLiveMetrics(selectedWorkspace: string) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!selectedWorkspace) return;
    fetchMetrics(selectedWorkspace)
      .then((data) => {
        setMetrics(data);
        setLastUpdated(new Date());
        setError(null);
      })
      .catch((err) => {
        setMetrics(PLACEHOLDER_METRICS);
        setLastUpdated(null);
        setError('No metrics found for the last 60 minutes.');
      });
  }, [selectedWorkspace]);

  const handleWsMessage = useCallback(
    (msg: any) => {
      console.log('[Dashboard] Received WebSocket message:', msg);
      console.log('[Dashboard] Current workspace:', selectedWorkspace);
      if (msg.type === 'metrics' && msg.payload.workspace_id === selectedWorkspace) {
        console.log('[Dashboard] Updating metrics for workspace:', selectedWorkspace);
        setMetrics(msg.payload.metrics);
        setLastUpdated(new Date());
        setError(null);
      } else if (msg.type === 'event') {
        console.log('[Dashboard] Received event for workspace:', msg.payload.workspace_id);
        if (msg.payload.workspace_id === selectedWorkspace) {
          console.log('[Dashboard] Refreshing metrics due to new event');
          // Add a small delay to allow the worker to process the event
          setTimeout(() => {
            fetchMetrics(selectedWorkspace)
              .then((data) => {
                setMetrics(data);
                setLastUpdated(new Date());
                setError(null);
              })
              .catch((err) => {
                console.error('[Dashboard] Failed to refresh metrics:', err);
              });
          }, 1000); // Wait 1 second for the worker to process the event
        }
      }
    },
    [selectedWorkspace],
  );

  useWebSocket(WS_URL, handleWsMessage);

  // Fallback polling if metrics are not updated by WebSocket
  // (could be improved with a timer or effect)
  // ...

  return { metrics, error, lastUpdated };
}
