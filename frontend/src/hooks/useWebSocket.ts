import { useCallback, useEffect, useRef, useState } from 'react';
import { WSMessage } from '@/types';

type Status = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  url: string;
  onMessage: (msg: WSMessage) => void;
  reconnectDelayMs?: number;
}

export function useWebSocket({ url, onMessage, reconnectDelayMs = 2000 }: UseWebSocketOptions) {
  const [status, setStatus] = useState<Status>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WSMessage;
        onMessageRef.current(msg);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      setTimeout(connect, reconnectDelayMs);
    };

    ws.onerror = () => {
      setStatus('error');
      ws.close();
    };
  }, [url, reconnectDelayMs]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  return { status };
}
