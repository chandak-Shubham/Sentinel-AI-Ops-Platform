import { apiRequest } from "@/services/api";
import type { WebhookLog } from "@/types/api";

export function getWebhookLogs() {
  return apiRequest<WebhookLog[]>("/webhooks/logs");
}

export function getWebhookLog(id: number) {
  return apiRequest<WebhookLog>(`/webhooks/logs/${id}`);
}

export const webhookService = {
  getWebhookLogs,
  getWebhookLog
};
