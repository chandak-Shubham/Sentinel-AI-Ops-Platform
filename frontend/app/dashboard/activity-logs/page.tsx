"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useActivityLogs } from "@/hooks/use-api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { formatDate } from "@/lib/utils";

export default function ActivityLogsPage() {
  const logs = useActivityLogs();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("ALL");
  const [date, setDate] = useState("");
  const [incident, setIncident] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const actionOptions = useMemo(() => ["ALL", ...Array.from(new Set((logs.data ?? []).map((log) => log.action)))], [logs.data]);
  const filtered = useMemo(() => {
    return (logs.data ?? []).filter((log) => {
      const haystack = `${log.action} ${log.details ?? ""} ${log.user_id ?? ""} ${log.incident_id ?? ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesAction = action === "ALL" || log.action === action;
      const matchesDate = !date || (log.created_at ?? "").startsWith(date);
      const matchesIncident = !incident || String(log.incident_id ?? "").includes(incident);
      return matchesSearch && matchesAction && matchesDate && matchesIncident;
    });
  }, [action, date, incident, logs.data, search]);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Audit activity across incidents, services, and users.</p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_220px_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search action, user, incident" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {actionOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" aria-label="Filter by date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Input placeholder="Incident ID" aria-label="Filter by incident" value={incident} onChange={(event) => setIncident(event.target.value)} />
        </CardContent>
      </Card>
      {logs.isLoading ? (
        <Skeleton className="h-96" />
      ) : logs.isError ? (
        <ErrorState message="Unable to load activity logs." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No activity logs found" description="Activity records will appear here when the backend emits them." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.user_id ? `User ${log.user_id}` : "System"}</TableCell>
                    <TableCell>{log.incident_id ? `#${log.incident_id}` : "Not linked"}</TableCell>
                    <TableCell className="max-w-md truncate">{log.details ?? "No details"}</TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <div className="border-t">
            <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
          </div>
        </Card>
      )}
    </div>
  );
}
