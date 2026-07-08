"use client";

import { useMemo, useState } from "react";
import { Bot, Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { useWebhookLog, useWebhookLogs } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/state-views";
import { LogLevelBadge, SeverityBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/services/api";
import { formatConfidence, getAIAnalysis } from "@/lib/ai";

export default function WebhookLogsPage() {
  const logs = useWebhookLogs();
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("ALL");
  const [service, setService] = useState("ALL");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const selectedLog = useWebhookLog(selectedId ?? undefined);
  const selectedAnalysisLog = useWebhookLog(selectedAnalysisId ?? undefined);

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
  const analysisDetail = selectedAnalysisLog.data;
  const analysis = getAIAnalysis(analysisDetail);

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
                  <TableHead>AI Analysis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedId(log.id)}>
                    <TableCell className="py-3.5 text-muted-foreground text-sm">{formatDate(log.received_at)}</TableCell>
                    <TableCell className="py-3.5 font-semibold text-foreground">{log.service}</TableCell>
                    <TableCell className="py-3.5"><LogLevelBadge value={log.level} /></TableCell>
                    <TableCell className="py-3.5 max-w-xl truncate text-muted-foreground text-sm">{log.message}</TableCell>
                    <TableCell className="py-3.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs font-semibold rounded-full border-border/60 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedAnalysisId(log.id);
                        }}
                      >
                        <Bot className="h-3.5 w-3.5 text-primary animate-pulse-slow" />
                        AI Analysis
                      </Button>
                    </TableCell>
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
      <Dialog open={Boolean(selectedAnalysisId)} onOpenChange={(open) => !open && setSelectedAnalysisId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Analysis
            </DialogTitle>
            <DialogDescription>
              {analysisDetail ? `${analysisDetail.service} analyzed from ${formatDate(analysisDetail.received_at)}` : "AI analysis details"}
            </DialogDescription>
          </DialogHeader>
          {selectedAnalysisLog.isLoading ? (
            <Skeleton className="h-80" />
          ) : selectedAnalysisLog.isError ? (
            <ErrorState message={getWebhookErrorMessage(selectedAnalysisLog.error, "Unable to load AI analysis.")} />
          ) : analysis ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-secondary/5 p-4 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assessed Severity</p>
                  <div className="mt-2.5"><SeverityBadge value={analysis.severity} /></div>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/5 p-4 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pipeline Confidence</p>
                  <p className="mt-2.5 text-xl font-extrabold text-primary">{formatConfidence(analysis.confidence)}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-secondary/5 p-4 flex flex-col justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Incident Created</p>
                  <div className="mt-2.5">
                    <Badge variant={analysis.should_create_incident ? "high" : "low"}>
                      {analysis.should_create_incident ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <AnalysisBlock title="AI Event Summary" value={analysis.summary} />
                <AnalysisBlock title="Assessed Root Cause" value={analysis.root_cause} />
                
                <div className="rounded-xl border border-border/70 p-5 bg-card hover:bg-secondary/10 transition-colors">
                  <p className="text-sm font-bold text-foreground">Actionable Recommendations</p>
                  <ul className="mt-3.5 space-y-2.5 pl-1.5 text-sm text-muted-foreground">
                    {analysis.recommendations.map((item, index) => (
                      <li key={item} className="flex gap-2.5 items-start leading-relaxed">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState title="No AI analysis available" description="This saved webhook log response does not include an AI analysis object yet." />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-4 bg-secondary/15">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-semibold break-words">{value}</p>
    </div>
  );
}

function AnalysisBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 p-5 bg-card hover:bg-secondary/10 transition-all duration-200">
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{value}</p>
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
