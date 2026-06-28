"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeConnectionStatus } from "@/types/api";

export function useWebSocket(
  url: string,
  onMessage: (event: MessageEvent) => void,
  enabled = true
): RealtimeConnectionStatus {
  const [status, setStatus] = useState<RealtimeConnectionStatus>("disconnected");
  const reconnectAttempt = useRef(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByEffect = useRef(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!enabled) {
      setStatus("disconnected");
      if (socketRef.current) {
        closedByEffect.current = true;
        socketRef.current.close();
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      return;
    }

    const connect = () => {
      setStatus(reconnectAttempt.current > 0 ? "reconnecting" : "disconnected");
      const socket = new WebSocket(url);
      socketRef.current = socket;
      closedByEffect.current = false;

      socket.onopen = () => {
        reconnectAttempt.current = 0;
        setStatus("connected");
      };

      socket.onmessage = (event) => {
        onMessageRef.current(event);
      };

      socket.onerror = () => {
        setStatus("disconnected");
      };

      socket.onclose = () => {
        if (closedByEffect.current) return;
        reconnectAttempt.current += 1;
        setStatus("reconnecting");
        const delay = Math.min(1000 * 2 ** Math.min(reconnectAttempt.current - 1, 4), 15000);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByEffect.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
      socketRef.current = null;
      setStatus("disconnected");
    };
  }, [enabled, url]);

  return status;
}
