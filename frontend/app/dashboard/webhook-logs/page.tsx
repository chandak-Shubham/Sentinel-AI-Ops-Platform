"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useWebhookLog, useWebhookLogs } from "@/hooks/use-api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { LogLevelBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/services/api";

export default function WebhookLogsPage() {
  const logs = useWebhookLogs();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("ALL");
  const [service, setService] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const selectedLog = useWebhookLog(selectedId ?? undefined);

  const services = useMemo(() => ["ALL", ...Array.from(new Set((logs.data ?? []).map((log) => log.service)))], [logs.data]);
  const filtered = useMemo(() => {
    return (logs.data ?? []).filter((log) => {
      const matchesSearch = `${log.service} ${log.message}`.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = level === "ALL" || log.level === level;
      const matchesService = service === "ALL" || log.service === service;
      return matchesSearch && matchesLevel && matchesService;
    });
  }, [level, logs.data, search, service]);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const detail = selectedLog.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Webhook Logs</h1>
        <p className="text-sm text-muted-foreground">Monitor inbound integration events and inspect raw payloads.</p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search webhook logs" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["ALL", "INFO", "WARNING", "ERROR", "CRITICAL"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={service} onValueChange={setService}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {services.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      {logs.isLoading ? (
        <Skeleton className="h-96" />
      ) : logs.isError ? (
        <ErrorState message={getWebhookErrorMessage(logs.error, "Unable to load webhook logs.")} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No webhook logs found" description="Webhook records will appear here when integrations send events." />
      ) : (
        <Card>
          <CardContent className="max-h-[620px] overflow-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer" onClick={() => setSelectedId(log.id)}>
                    <TableCell>{formatDate(log.received_at)}</TableCell>
                    <TableCell className="font-medium">{log.service}</TableCell>
                    <TableCell><LogLevelBadge value={log.level} /></TableCell>
                    <TableCell className="max-w-xl truncate">{log.message}</TableCell>
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
      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>JSON Payload</DialogTitle>
            <DialogDescription>{detail ? `${detail.service} received at ${formatDate(detail.received_at)}` : "Webhook payload"}</DialogDescription>
          </DialogHeader>
          {selectedLog.isLoading ? (
            <Skeleton className="h-64" />
          ) : selectedLog.isError ? (
            <ErrorState message={getWebhookErrorMessage(selectedLog.error, "Unable to load webhook log details.")} />
          ) : detail ? (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
                <Info label="Service" value={detail.service} />
                <Info label="Level" value={detail.level} />
                <Info label="Message" value={detail.message} />
                <Info label="Received At" value={formatDate(detail.received_at)} />
              </div>
              <pre className="max-h-[360px] overflow-auto rounded-md border bg-muted p-4 text-xs leading-5">
                {JSON.stringify(detail.payload ?? {}, null, 2)}
              </pre>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words">{value}</p>
    </div>
  );
}

function getWebhookErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) return fallback;
  if (error.status === 401) return "You are not authenticated. Please log in again.";
  if (error.status === 403) return "You do not have permission to view webhook logs.";
  if (error.status === 404) return "The requested webhook log was not found.";
  if (error.status >= 500) return "The webhook logs service is unavailable. Please try again later.";
  return error.detail || fallback;
}
