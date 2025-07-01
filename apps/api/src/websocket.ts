import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;
const clients = new Set<WebSocket>();

export function setupWebSocketServer(server: HttpServer) {
  wss = new WebSocketServer({ server });
  console.log('[WebSocket] Server setup complete');
  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected, total clients:', clients.size + 1);
    clients.add(ws);
    ws.on('close', () => {
      clients.delete(ws);
      console.log('[WebSocket] Client disconnected, total clients:', clients.size);
    });
  });
}

export function broadcast(type: string, payload: any) {
  const msg = JSON.stringify({ type, payload });
  console.log('[WebSocket] Broadcasting:', type, 'to', clients.size, 'clients');
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(msg);
    }
  }
}
