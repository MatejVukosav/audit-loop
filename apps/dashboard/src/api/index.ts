import { useEffect, useRef } from 'react';
import type { Metrics } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8009';

export async function fetchWorkspaces(): Promise<string[]> {
  const res = await fetch(`${API_URL}/workspaces`);
  if (!res.ok) throw new Error('Failed to fetch workspaces');
  return res.json();
}

export async function fetchMetrics(workspaceId: string): Promise<Metrics> {
  const res = await fetch(`${API_URL}/metrics?workspace_id=${workspaceId}`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function sendEvent(event: any): Promise<void> {
  await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
}

export function useMetricsWebSocket(onMessage: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new window.WebSocket(API_URL.replace(/^http/, 'ws'));
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch {}
    };
    return () => ws.close();
  }, [onMessage]);
  return wsRef;
}
