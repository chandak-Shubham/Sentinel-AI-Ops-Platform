"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bot, CheckCircle2, History, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useActivityLogs, useDeleteIncident, useIncident, useIncidentTimeline, useIncidents, useResolveIncident, useTeams, useUpdateIncidentStatus, useWebhookLogs } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { SeverityBadge, StatusBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { canDeleteIncidents, canMutateIncidents, canViewLogs } from "@/lib/rbac";
import {
  findIncidentAnalysis,
  formatConfidence,
  getAIDecision,
  getRuleEngineValidation,
  isAIGeneratedIncident,
  isAIUnavailable,
  normalizeConfidence
} from "@/lib/ai";

export default function IncidentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const auth = useAuth();
  const incidents = useIncidents();
  const teams = useTeams();
  const incidentId = Number(params.id);
  const incidentQuery = useIncident(incidentId);
  const timeline = useIncidentTimeline(incidentId);
  const updateStatus = useUpdateIncidentStatus();
  const resolveIncident = useResolveIncident();
  const deleteIncident = useDeleteIncident();
  const canSeeLogs = canViewLogs(auth.profile);
  const activityLogs = useActivityLogs(canSeeLogs);
  const webhookLogs = useWebhookLogs(canSeeLogs);
  const incident = useMemo(() => incidentQuery.data ?? incidents.data?.find((item) => item.id === incidentId), [incidentQuery.data, incidents.data, incidentId]);
  const teamName = teams.data?.find((team) => team.id === incident?.team_id)?.name ?? (incident?.team_id ? `Team ${incident.team_id}` : "Unassigned");
  const aiGenerated = Boolean(incident && isAIGeneratedIncident(incident));
  const aiActivity = (activityLogs.data ?? []).find((entry) => entry.incident_id === incidentId && entry.action === "AI_CREATE_INCIDENT");
  const aiAnalysis = incident ? findIncidentAnalysis(incident, webhookLogs.data ?? []) : null;
  const aiSummary = aiAnalysis?.summary ?? incident?.ai_summary ?? incident?.description ?? "No AI summary is available.";
  const aiUnavailable = isAIUnavailable(aiSummary);
  const aiDecision = getAIDecision(aiAnalysis, incident);
  const ruleEngineValidation = getRuleEngineValidation(aiAnalysis, incident);
  const validationLabel = aiUnavailable
    ? "Fallback Rule Validation Used"
    : ruleEngineValidation.toLowerCase().includes("reject")
      ? "Rejected"
      : ruleEngineValidation.toLowerCase().includes("approved") || ruleEngineValidation.toLowerCase().includes("valid")
        ? "Validated"
        : ruleEngineValidation;
  const validationVariant = aiUnavailable ? "medium" : validationLabel === "Rejected" ? "critical" : validationLabel === "Validated" ? "low" : "secondary";
  const hasAIAnalysis = Boolean(
    aiAnalysis ||
    incident?.ai_summary ||
    incident?.ai_root_cause ||
    incident?.ai_recommendations?.length ||
    incident?.ai_confidence != null ||
    incident?.ai_decision ||
    incident?.rule_engine_validation ||
    incident?.rule_engine_status ||
    incident?.validation_status
  );

  if (incidentQuery.isLoading || incidents.isLoading) return <Skeleton className="h-96" />;
  if (incidentQuery.isError && incidents.isError) return <ErrorState message="Unable to load incident details." />;
  if (!incident) return <EmptyState title="Incident not found" description="The backend list endpoint did not return this incident." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold">{incident.title}</h1>
          <p className="text-sm text-muted-foreground">Incident #{incident.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {aiGenerated && (
            <Badge variant="secondary" className="gap-1">
              🤖 AI Generated
            </Badge>
          )}
          <SeverityBadge value={incident.severity} />
          <StatusBadge value={incident.status} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Review ownership, timestamps, and operational context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="mt-1 text-sm text-muted-foreground">{incident.description || "No description provided."}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Assigned Engineer" value={incident.assigned_to ? `User ${incident.assigned_to}` : "Unassigned"} />
              <Info label="Team" value={teamName} />
              <Info label="Created At" value={formatDate(incident.created_at)} />
              <Info label="Updated At" value={formatDate(incident.updated_at)} />
              <Info label="Resolved At" value={formatDate(incident.resolved_at)} />
              <Info label="Source" value={incident.source ?? "Not available"} />
            </div>
          </CardContent>
        </Card>
        {hasAIAnalysis && (
          <Card className="border-primary/30 lg:col-start-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                AI Incident Analysis
              </CardTitle>
              <CardDescription>Context generated from the webhook AI pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiUnavailable && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4">
                  <Badge variant="medium">AI Temporarily Unavailable</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">Fallback Rule Validation Used</p>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <Info label="AI Decision" value={aiDecision} />
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Rule Engine Validation</p>
                  <div className="mt-2">
                    <Badge variant={validationVariant}>{validationLabel}</Badge>
                  </div>
                </div>
              </div>
              <AnalysisInfo label="AI Summary" value={aiSummary} />
              <AnalysisInfo label="AI Root Cause" value={aiAnalysis?.root_cause ?? incident.ai_root_cause ?? "Root cause was not included in this incident response."} />
              <div className="rounded-md border p-4">
                <p className="text-sm font-semibold">AI Recommendations</p>
                {aiAnalysis?.recommendations?.length || incident.ai_recommendations?.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                    {(aiAnalysis?.recommendations ?? incident.ai_recommendations ?? []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Recommendations were not included in this incident response.</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ConfidenceMeter value={aiAnalysis?.confidence ?? incident.ai_confidence} />
                <div className="rounded-md border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Severity</p>
                  <div className="mt-2"><SeverityBadge value={aiAnalysis?.severity ?? incident.severity} /></div>
                </div>
                <Info label="AI Activity" value={aiActivity ? "AI created this incident from a webhook." : "Created from webhook source."} />
              </div>
            </CardContent>
          </Card>
        )}
        <div className="space-y-6 lg:col-start-2 lg:row-start-1">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Update, resolve, or remove this incident record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!canMutateIncidents(auth.profile) && (
                <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">View-only role. You can inspect this incident but cannot change it.</p>
              )}
              {canMutateIncidents(auth.profile) && (
                <>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast.info("Edit form is ready to connect to PATCH /incidents/{id}.")}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              {[
                { label: "Mark In Progress", status: "IN_PROGRESS" as const },
                { label: "Close Incident", status: "CLOSED" as const }
              ].map((action) => (
                <Button
                  key={action.status}
                  className="w-full justify-start"
                  variant={incident.status === action.status ? "secondary" : "outline"}
                  disabled={updateStatus.isPending || incident.status === action.status}
                  onClick={() =>
                    updateStatus.mutate(
                      { incidentId, status: action.status },
                      {
                        onSuccess: () => toast.success(`Incident updated to ${action.status}`),
                        onError: (error: Error) => toast.error(error.message || "Unable to update status")
                      }
                    )
                  }
                >
                  {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {action.label}
                </Button>
              ))}
              <Button
                className="w-full justify-start"
                variant="secondary"
                disabled={resolveIncident.isPending || incident.status === "RESOLVED"}
                onClick={() =>
                  resolveIncident.mutate(incidentId, {
                    onSuccess: () => toast.success("Incident resolved"),
                    onError: (error: Error) => toast.error(error.message || "Unable to resolve incident")
                  })
                }
              >
                {resolveIncident.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Resolve
              </Button>
                </>
              )}
              {canDeleteIncidents(auth.profile) && (
              <Button
                className="w-full justify-start"
                variant="destructive"
                disabled={deleteIncident.isPending}
                onClick={() => {
                  if (!window.confirm("Delete this incident? This action cannot be undone.")) return;
                  deleteIncident.mutate(incidentId, {
                    onSuccess: () => {
                      toast.success("Incident deleted");
                      router.push("/dashboard/incidents");
                    },
                    onError: (error: Error) => toast.error(error.message || "Unable to delete incident")
                  });
                }}
              >
                {deleteIncident.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.isLoading && <div className="text-sm text-muted-foreground">Loading timeline...</div>}
              {timeline.isError && <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">Unable to load incident timeline.</p>}
              {aiGenerated && (
                <div className="relative flex gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">🤖 AI created this incident from a webhook.</p>
                    <p className="mt-1 text-sm text-muted-foreground">{aiActivity?.details ?? "AI webhook pipeline generated this incident."}</p>
                    {aiActivity?.created_at && <p className="mt-2 text-xs text-muted-foreground">{formatDate(aiActivity.created_at)}</p>}
                  </div>
                </div>
              )}
              {!timeline.isLoading && !timeline.isError && (timeline.data ?? []).length === 0 && !aiGenerated && (
                <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">No timeline events are available for this incident yet.</p>
              )}
              {(timeline.data ?? []).map((entry) => (
                <div key={entry.id} className="relative flex gap-3 rounded-md border p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <History className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{entry.action_type.replace(/_/g, " ")}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.message ?? "Timeline event recorded."}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatDate(entry.created_at)}</span>
                      <span>{entry.performed_by ? `User ${entry.performed_by}` : "System"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function ConfidenceMeter({ value }: { value?: number | null }) {
  const normalized = normalizeConfidence(value);

  return (
    <div className="rounded-md border p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">AI Confidence</p>
      <p className="mt-1 text-sm">{formatConfidence(value)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${normalized ?? 0}%` }} />
      </div>
    </div>
  );
}

function AnalysisInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}
