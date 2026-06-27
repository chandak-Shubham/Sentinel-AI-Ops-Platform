"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, History, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteIncident, useIncident, useIncidentTimeline, useIncidents, useResolveIncident, useTeams, useUpdateIncidentStatus } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { SeverityBadge, StatusBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";

export default function IncidentDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const incidents = useIncidents();
  const teams = useTeams();
  const incidentId = Number(params.id);
  const incidentQuery = useIncident(incidentId);
  const timeline = useIncidentTimeline(incidentId);
  const updateStatus = useUpdateIncidentStatus();
  const resolveIncident = useResolveIncident();
  const deleteIncident = useDeleteIncident();
  const incident = useMemo(() => incidentQuery.data ?? incidents.data?.find((item) => item.id === incidentId), [incidentQuery.data, incidents.data, incidentId]);
  const teamName = teams.data?.find((team) => team.id === incident?.team_id)?.name ?? (incident?.team_id ? `Team ${incident.team_id}` : "Unassigned");

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
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Update, resolve, or remove this incident record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.isLoading && <div className="text-sm text-muted-foreground">Loading timeline...</div>}
              {timeline.isError && <p className="rounded-md border border-destructive/40 p-3 text-sm text-destructive">Unable to load incident timeline.</p>}
              {!timeline.isLoading && !timeline.isError && (timeline.data ?? []).length === 0 && (
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
