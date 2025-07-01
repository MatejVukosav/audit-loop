import { useEffect, useRef } from 'react';

export function useWebSocket(url: string, onMessage: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    console.log('[WebSocket] Connecting to:', url);
    const ws = new window.WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected successfully');
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      console.log('[WebSocket] Received message:', event.data);
      try {
        const msg = JSON.parse(event.data);
        onMessage(msg);
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Connection error:', error);
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Connection closed, code:', event.code, 'reason:', event.reason);
      // Attempt to reconnect after 3 seconds
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, 3000);
      }
    };
  };

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url]);

  // Update onMessage callback without reconnecting
  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = (event) => {
        console.log('[WebSocket] Received message:', event.data);
        try {
          const msg = JSON.parse(event.data);
          onMessage(msg);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };
    }
  }, [onMessage]);

  return wsRef;
}
