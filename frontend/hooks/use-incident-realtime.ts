"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WS_URL } from "@/services/api";
import type { IncidentRealtimeEvent } from "@/types/api";

export function useIncidentRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let closedByEffect = false;

    const connect = () => {
      const socket = new WebSocket(WS_URL);

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as IncidentRealtimeEvent;
          if (event.event !== "incident_created" && event.event !== "incident_status_changed") return;

          queryClient.invalidateQueries({ queryKey: ["incidents"] });
          queryClient.invalidateQueries({ queryKey: ["incident-timeline", event.incident_id] });

          if (event.event === "incident_created") {
            toast.info(`New incident created: ${event.title ?? `#${event.incident_id}`}`);
          } else {
            toast.info(`Incident #${event.incident_id} moved to ${event.new_status ?? "a new status"}`);
          }
        } catch {
          queryClient.invalidateQueries({ queryKey: ["incidents"] });
        }
      };

      socket.onclose = () => {
        if (!closedByEffect) reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [queryClient]);
}
