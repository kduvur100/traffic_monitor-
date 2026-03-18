import { Server as HttpServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { config } from '../config/index.js';
import { WSMessage } from '../types/index.js';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: HttpServer) {
  wss = new WebSocketServer({ server, path: config.wsPath });

  wss.on('connection', (ws) => {
    console.log('[WS] client connected — total:', wss!.clients.size);

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as { type: string };
        if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'ping' }));
      } catch { /* ignore malformed */ }
    });

    ws.on('close', () =>
      console.log('[WS] client disconnected — total:', wss!.clients.size)
    );

    ws.on('error', (err) =>
      console.error('[WS] socket error:', err.message)
    );
  });

  console.log(`[WS] server ready on path ${config.wsPath}`);
  return wss;
}

/** Broadcast a typed message to all connected clients. */
export function broadcast<T>(type: WSMessage['type'], payload: T) {
  if (!wss) return;
  const data = JSON.stringify({ type, payload } satisfies WSMessage<T>);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}
