"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Clock, History } from "lucide-react";
import { useIncidents, useTeams } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { SeverityBadge, StatusBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";

export default function IncidentDetailsPage() {
  const params = useParams<{ id: string }>();
  const incidents = useIncidents();
  const teams = useTeams();
  const incidentId = Number(params.id);
  const incident = useMemo(() => incidents.data?.find((item) => item.id === incidentId), [incidents.data, incidentId]);
  const teamName = teams.data?.find((team) => team.id === incident?.team_id)?.name ?? (incident?.team_id ? `Team ${incident.team_id}` : "Unassigned");

  if (incidents.isLoading) return <Skeleton className="h-96" />;
  if (incidents.isError) return <ErrorState message="Unable to load incident details." />;
  if (!incident) return <EmptyState title="Incident not found" description="The backend list endpoint did not return this incident." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold">{incident.title}</h1>
          <p className="text-sm text-muted-foreground">Incident #{incident.id}</p>
        </div>
        <div className="flex gap-2">
          <SeverityBadge value={incident.severity} />
          <StatusBadge value={incident.status} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Incidents are permanent records. No delete action is available.</CardDescription>
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
              <CardTitle>Status Actions</CardTitle>
              <CardDescription>The backend does not currently expose a status update endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {["Mark In Progress", "Mark Resolved", "Close Incident"].map((label) => (
                <Button key={label} className="w-full justify-start" variant="outline" disabled>
                  <Clock className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                  <History className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">Incident created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(incident.created_at)}</p>
                </div>
              </div>
              <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground">Detailed incident history will appear when the backend exposes timeline data.</p>
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
