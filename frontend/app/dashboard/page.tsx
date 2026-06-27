"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, ListChecks, Siren } from "lucide-react";
import { useIncidents, useLogs, useWebhookLogs } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { SeverityBadge, StatusBadge, LogLevelBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const incidents = useIncidents();
  const logs = useLogs();
  const webhookLogs = useWebhookLogs();
  const items = incidents.data ?? [];
  const today = new Date().toDateString();
  const stats = [
    { label: "Total Incidents", subtitle: "All tracked cases", value: items.length, icon: ListChecks },
    { label: "Open Incidents", subtitle: "Need triage", value: items.filter((item) => item.status === "OPEN").length, icon: AlertTriangle },
    { label: "Critical Incidents", subtitle: "Highest severity", value: items.filter((item) => item.severity === "CRITICAL").length, icon: Siren },
    {
      label: "Resolved Today",
      subtitle: "Closed this cycle",
      value: items.filter((item) => item.resolved_at && new Date(item.resolved_at).toDateString() === today).length,
      icon: CheckCircle2
    }
  ];
  const timeline = [
    ...items.slice(0, 4).map((incident) => ({
      id: `incident-${incident.id}`,
      action: `${incident.title} moved to ${incident.status.replace(/_/g, " ").toLowerCase()}`,
      actor: incident.assigned_to ? `User ${incident.assigned_to}` : "Sentinel",
      time: formatDate(incident.updated_at ?? incident.created_at)
    })),
    ...(logs.data ?? []).slice(0, 2).map((log) => ({
      id: `log-${log.id}`,
      action: log.message,
      actor: log.service_name,
      time: formatDate(log.created_at)
    }))
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Live operational summary for incident response teams.</p>
        </div>
        <Link className="text-sm font-medium text-primary hover:text-primary/80" href="/dashboard/incidents">
          View all incidents
        </Link>
      </div>
      {incidents.isError && <ErrorState message="Unable to load incident summary." />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="transition-transform hover:-translate-y-0.5 hover:border-primary/40">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{incidents.isLoading ? "..." : stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
                <Icon className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.isLoading ? (
              <Skeleton className="h-44" />
            ) : items.length === 0 ? (
              <EmptyState title="No incidents" description="Incidents created through the backend will appear here." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.slice(0, 6).map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <Link className="font-medium text-primary" href={`/dashboard/incidents/${incident.id}`}>
                          {incident.title}
                        </Link>
                      </TableCell>
                      <TableCell><SeverityBadge value={incident.severity} /></TableCell>
                      <TableCell><StatusBadge value={incident.status} /></TableCell>
                      <TableCell>{incident.assigned_to ? `User ${incident.assigned_to}` : "Unassigned"}</TableCell>
                      <TableCell>{formatDate(incident.created_at)}</TableCell>
                      <TableCell>
                        <Link className="inline-flex items-center gap-1 text-sm text-primary" href={`/dashboard/incidents/${incident.id}`}>
                          Open <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {incidents.isLoading || logs.isLoading ? (
              <Skeleton className="h-44" />
            ) : timeline.length === 0 ? (
              <EmptyState title="No activity yet" description="Incident and log activity will appear here." />
            ) : (
              timeline.map((entry) => (
                <div key={entry.id} className="relative flex gap-3 border-l pl-4">
                  <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary" />
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {entry.actor.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">{entry.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.actor} | {entry.time}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {webhookLogs.isLoading ? (
            <Skeleton className="h-44" />
          ) : webhookLogs.isError ? (
            <ErrorState message="Unable to load webhook logs." />
          ) : (webhookLogs.data ?? []).length === 0 ? (
            <EmptyState title="No webhook logs" description="Webhook log records will appear here as integrations are connected." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Received Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(webhookLogs.data ?? []).slice(0, 6).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.service}</TableCell>
                      <TableCell><LogLevelBadge value={log.level} /></TableCell>
                      <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                      <TableCell>{formatDate(log.received_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
