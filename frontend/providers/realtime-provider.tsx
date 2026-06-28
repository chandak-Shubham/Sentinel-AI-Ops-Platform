"use client";

import { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { useWebSocket } from "@/hooks/use-websocket";
import { WS_URL } from "@/services/api";
import type { ActivityLog, Incident, RealtimeConnectionStatus, SentinelRealtimeEvent, WebhookLog } from "@/types/api";

const DashboardRealtimeContext = createContext<RealtimeConnectionStatus>("disconnected");

function prependById<T extends { id: number }>(items: T[] | undefined, item: T) {
  const current = items ?? [];
  return [item, ...current.filter((entry) => entry.id !== item.id)];
}

function getEventTime(eventTimestamp?: string | null) {
  return eventTimestamp ?? new Date().toISOString();
}

export function DashboardRealtimeProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const enabled = auth.isAuthenticated;

  const status = useWebSocket(
    WS_URL,
    (message) => {
      try {
        const event = JSON.parse(message.data) as SentinelRealtimeEvent;

        if (event.type === "webhook_received") {
          const receivedAt = getEventTime(event.timestamp);
          const webhook: WebhookLog = {
            ...event.data,
            payload: event.data.payload ?? {},
            received_at: event.data.received_at ?? receivedAt
          };

          queryClient.setQueryData<WebhookLog[]>(["webhook-logs"], (current) => prependById(current, webhook));
          queryClient.setQueryData<WebhookLog>(["webhook-log", webhook.id], webhook);
          toast.info(`New webhook received from ${webhook.service}`);
          return;
        }

        if (event.type === "incident_created") {
          const createdAt = getEventTime(event.timestamp);
          const incident: Incident = {
            ...event.data,
            created_at: event.data.created_at ?? createdAt,
            updated_at: event.data.updated_at ?? createdAt
          };

          queryClient.setQueryData<Incident[]>(["incidents"], (current) => prependById(current, incident));
          queryClient.setQueryData<Incident>(["incident", incident.id], incident);
          toast.info(`New ${incident.severity ? `${incident.severity.toLowerCase()} ` : ""}Incident Created`);
          return;
        }

        if (event.type === "activity_created") {
          const activity: ActivityLog = {
            ...event.data,
            created_at: event.data.created_at ?? getEventTime(event.timestamp)
          };

          queryClient.setQueryData<ActivityLog[]>(["activity-logs"], (current) => prependById(current, activity));
          toast.info("Activity Log Updated");
        }
      } catch (error) {
        console.error("Unable to process realtime event", error);
      }
    },
    enabled
  );

  return <DashboardRealtimeContext.Provider value={status}>{children}</DashboardRealtimeContext.Provider>;
}

export function useDashboardRealtimeStatus() {
  return useContext(DashboardRealtimeContext);
}
