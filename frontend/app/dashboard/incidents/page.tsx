"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { ExternalLink, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIncidents, useTeams } from "@/hooks/use-api";
import { CreateIncidentDialog } from "@/features/incidents/create-incident-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { SeverityBadge, StatusBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";

export default function IncidentsPage() {
  const incidents = useIncidents();
  const teams = useTeams();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return (incidents.data ?? []).filter((incident) => {
      const matchesSearch = `${incident.id} ${incident.title} ${incident.description ?? ""}`.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severity === "ALL" || incident.severity === severity;
      const matchesStatus = status === "ALL" || incident.status === status;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents.data, search, severity, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const teamName = (teamId?: number | null) => teams.data?.find((team) => team.id === teamId)?.name ?? (teamId ? `Team ${teamId}` : "Unassigned");

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Incidents</h1>
          <p className="text-sm text-muted-foreground">Search, filter, review, and create incident records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/incidents/new">
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              New Page
            </Button>
          </Link>
          <CreateIncidentDialog />
        </div>
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search incidents" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {incidents.isLoading ? (
        <Skeleton className="h-96" />
      ) : incidents.isError ? (
        <ErrorState message="Unable to load incidents." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No incidents found" description="Create an incident or adjust your filters." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell>#{incident.id}</TableCell>
                    <TableCell>
                      <Link className="font-medium text-primary" href={`/dashboard/incidents/${incident.id}`}>{incident.title}</Link>
                    </TableCell>
                    <TableCell><SeverityBadge value={incident.severity} /></TableCell>
                    <TableCell><StatusBadge value={incident.status} /></TableCell>
                    <TableCell>{incident.assigned_to ? `User ${incident.assigned_to}` : "Unassigned"}</TableCell>
                    <TableCell>{teamName(incident.team_id)}</TableCell>
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
          </CardContent>
          <div className="border-t">
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={(next) => setPage(next)} />
          </div>
        </Card>
      )}
    </div>
  );
}
