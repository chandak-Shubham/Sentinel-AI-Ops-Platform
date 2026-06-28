import type { AIAnalysis, Incident, WebhookLog } from "@/types/api";

export function getAIAnalysis(log?: WebhookLog | null): AIAnalysis | null {
  return log?.analysis ?? log?.ai_analysis ?? null;
}

export function isAIGeneratedIncident(incident?: Incident | null) {
  return (incident?.source ?? "").toUpperCase() === "WEBHOOK";
}

export function formatConfidence(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
}

export function findIncidentAnalysis(incident: Incident, logs: WebhookLog[]) {
  const description = (incident.description ?? "").trim();
  const title = incident.title.toLowerCase();

  return logs
    .map((log) => getAIAnalysis(log))
    .find((analysis) => {
      if (!analysis) return false;
      if (description && analysis.summary.trim() === description) return true;
      return title.includes(String(analysis.webhook_log_id)) || title.includes(analysis.severity.toLowerCase());
    }) ?? null;
}
