import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogLevelBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/state-views";
import { WebhookLog } from "@/types/api";

interface WebhookLogsTableProps {
  logs: WebhookLog[];
}

export function WebhookLogsTable({ logs }: WebhookLogsTableProps) {
  return (
    <Card className="hover:border-primary/20 duration-300">
      <CardHeader>
        <CardTitle className="text-base font-bold">Recent Webhook Payload Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <EmptyState title="No webhook logs" description="Webhook log records will appear here as integrations are connected." />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Service</TableHead>
                  <TableHead>Log Level</TableHead>
                  <TableHead>Message Summary</TableHead>
                  <TableHead>Received Time</TableHead>
                  <TableHead>AI Analysis Decision</TableHead>
                  <TableHead className="text-right">Action Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.slice(0, 6).map((log) => {
                  const decision = log.ai_analysis
                    ? log.ai_analysis.should_create_incident
                      ? "Create Incident"
                      : "Filtered"
                    : "No Analysis";

                  const status = log.ai_analysis
                    ? log.ai_analysis.should_create_incident
                      ? "Incident Triggered"
                      : "Ignored"
                    : "Log Logged";

                  return (
                    <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="py-3.5 font-semibold text-foreground">{log.service}</TableCell>
                      <TableCell className="py-3.5"><LogLevelBadge value={log.level} /></TableCell>
                      <TableCell className="py-3.5 max-w-sm truncate text-muted-foreground text-sm">{log.message}</TableCell>
                      <TableCell className="py-3.5 text-muted-foreground text-sm">{formatDate(log.received_at)}</TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant={
                            decision === "Create Incident"
                              ? "critical"
                              : decision === "Filtered"
                              ? "low"
                              : "secondary"
                          }
                        >
                          {decision}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                        {status}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
