"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useLogs } from "@/hooks/use-api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { LogLevelBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";

export default function LogsPage() {
  const logs = useLogs();
    const [search, setSearch] = useState("");
    const [level, setLevel] = useState("ALL");
    const [sort, setSort] = useState("NEWEST");
    const [page, setPage] = useState(1);
    const pageSize = 10;

  const filtered = useMemo(() => {
    return [...(logs.data ?? [])]
      .filter((log) => {
        const matchesSearch = `${log.service_name} ${log.source ?? ""} ${log.event_type} ${log.message}`.toLowerCase().includes(search.toLowerCase());
        const matchesLevel = level === "ALL" || log.log_level === level;
        return matchesSearch && matchesLevel;
      })
      .sort((a, b) => {
        const left = new Date(a.created_at ?? 0).getTime();
        const right = new Date(b.created_at ?? 0).getTime();
        return sort === "NEWEST" ? right - left : left - right;
      });
  }, [logs.data, level, search, sort]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Logs</h1>
        <p className="text-sm text-muted-foreground">Search, filter, and sort backend log records.</p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search logs" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><ArrowDownUp className="h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest</SelectItem>
              <SelectItem value="OLDEST">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {logs.isLoading ? (
        <Skeleton className="h-96" />
      ) : logs.isError ? (
        <ErrorState message="Unable to load logs." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No logs found" description="Logs from the backend will appear here." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Log Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.service_name}</TableCell>
                    <TableCell>{log.source ?? "Not available"}</TableCell>
                    <TableCell>{log.event_type}</TableCell>
                    <TableCell><LogLevelBadge value={log.log_level} /></TableCell>
                    <TableCell className="max-w-md truncate">{log.message}</TableCell>
                    <TableCell>{formatDate(log.created_at)}</TableCell>
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
