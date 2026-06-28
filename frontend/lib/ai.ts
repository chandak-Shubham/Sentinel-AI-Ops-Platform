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

export function normalizeConfidence(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, value <= 1 ? value * 100 : value));
}

export function isAIUnavailable(summary?: string | null) {
  return (summary ?? "").trim().toLowerCase() === "ai analysis unavailable.";
}

export function getAIDecision(analysis?: AIAnalysis | null, incident?: Incident | null) {
  const explicitDecision = analysis?.ai_decision ?? incident?.ai_decision;
  if (explicitDecision) return explicitDecision;
  const shouldCreate = analysis?.should_create_incident ?? isAIGeneratedIncident(incident);
  return shouldCreate ? "Create Incident" : "Do Not Create Incident";
}

export function getRuleEngineValidation(analysis?: AIAnalysis | null, incident?: Incident | null) {
  const explicitValidation =
    analysis?.rule_engine_validation ??
    analysis?.rule_engine_status ??
    analysis?.validation_status ??
    incident?.rule_engine_validation ??
    incident?.rule_engine_status ??
    incident?.validation_status;

  if (explicitValidation) return explicitValidation;
  if (isAIGeneratedIncident(incident)) return "Approved";
  return "Not available";
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
