"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ListChecks, Siren } from "lucide-react";
import { useIncidents, useLogs } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { SeverityBadge, StatusBadge, LogLevelBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const incidents = useIncidents();
  const logs = useLogs();
  const items = incidents.data ?? [];
  const stats = [
    { label: "Total Incidents", value: items.length, icon: ListChecks },
    { label: "Open Incidents", value: items.filter((item) => item.status === "OPEN").length, icon: AlertTriangle },
    { label: "In Progress Incidents", value: items.filter((item) => item.status === "IN_PROGRESS").length, icon: Clock },
    { label: "Resolved Incidents", value: items.filter((item) => item.status === "RESOLVED").length, icon: CheckCircle2 },
    { label: "Critical Incidents", value: items.filter((item) => item.severity === "CRITICAL").length, icon: Siren }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">Live operational summary from backend incidents and logs.</p>
      </div>
      {incidents.isError && <ErrorState message="Unable to load incident summary." />}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{incidents.isLoading ? "..." : stat.value}</p>
                </div>
                <Icon className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
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
                    <TableHead>Created</TableHead>
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
                      <TableCell>{formatDate(incident.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.isLoading ? (
              <Skeleton className="h-44" />
            ) : logs.isError ? (
              <ErrorState message="Unable to load logs." />
            ) : (logs.data ?? []).length === 0 ? (
              <EmptyState title="No logs" description="Application logs from the backend will appear here." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(logs.data ?? []).slice(0, 6).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.service_name}</TableCell>
                      <TableCell><LogLevelBadge value={log.log_level} /></TableCell>
                      <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
