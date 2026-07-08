"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useActivityLogs, useIncidents, useWebhookLogs } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/state-views";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { canViewLogs } from "@/lib/rbac";
import { formatConfidence, getAIAnalysis, isAIGeneratedIncident } from "@/lib/ai";

// Modular Dashboard Sub-components
import { DashboardStats } from "@/components/dashboard/stats";
import { IncidentTrendChart } from "@/components/dashboard/trend-chart";
import { SeverityDistributionChart } from "@/components/dashboard/distribution-chart";
import { RecentIncidentsTable } from "@/components/dashboard/incidents-table";
import { ActivityTimeline } from "@/components/dashboard/timeline";
import { AIInsightsPanel } from "@/components/dashboard/ai-panel";
import { WebhookLogsTable } from "@/components/dashboard/webhook-table";

export default function DashboardOverviewPage() {
  const incidents = useIncidents();
  const auth = useAuth();
  const canSeeLogs = canViewLogs(auth.profile);
  const webhookLogs = useWebhookLogs(canSeeLogs);
  const activityLogs = useActivityLogs(canSeeLogs);

  const items = incidents.data ?? [];
  const aiAnalyses = (webhookLogs.data ?? []).map((log) => getAIAnalysis(log)).filter(Boolean);
  const aiCreatedIncidents = items.filter((item) => isAIGeneratedIncident(item));
  const averageConfidence =
    aiAnalyses.length > 0
      ? aiAnalyses.reduce((total, analysis) => total + (analysis?.confidence ?? 0), 0) / aiAnalyses.length
      : null;

  const today = new Date().toDateString();

  const timeline = (activityLogs.data ?? []).slice(0, 5).map((log) => ({
    id: `activity-${log.id}`,
    action: log.details ?? log.action,
    actor: log.user_id ? `User ${log.user_id}` : "Sentinel",
    time: formatDate(log.created_at)
  }));

  return (
    <div className="space-y-6">
      {/* 1. Header Area */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Operations Center</h1>
          <p className="text-sm text-muted-foreground">Real-time incident intelligence and service telemetry.</p>
        </div>
        <Link
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          href="/dashboard/incidents"
        >
          View all incidents <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {incidents.isError && <ErrorState message="Unable to load incident operations metrics." />}

      {/* 2. Top Summary KPI Cards (Single Row) */}
      <DashboardStats
        isLoading={incidents.isLoading}
        total={items.length}
        open={items.filter((item) => item.status === "OPEN").length}
        critical={items.filter((item) => item.severity === "CRITICAL").length}
        resolved={items.filter((item) => item.resolved_at && new Date(item.resolved_at).toDateString() === today).length}
      />

      {/* 3. AI Operational Insights (Visual Charts Grid) */}
      <div className="grid gap-6 md:grid-cols-2">
        {incidents.isLoading ? (
          <Skeleton className="h-[200px]" />
        ) : (
          <IncidentTrendChart data={items} />
        )}
        {incidents.isLoading ? (
          <Skeleton className="h-[200px]" />
        ) : (
          <SeverityDistributionChart data={items} />
        )}
      </div>

      {/* 4. Main Operations Section */}
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="hover:border-primary/20 duration-300">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-3 space-y-0">
            <CardTitle className="text-base font-bold">Recent Incidents</CardTitle>
            <Link className="text-xs font-semibold text-primary hover:underline" href="/dashboard/incidents">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {incidents.isLoading ? (
              <Skeleton className="h-44" />
            ) : (
              <RecentIncidentsTable items={items} />
            )}
          </CardContent>
        </Card>

        {activityLogs.isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <ActivityTimeline timeline={timeline} />
        )}
      </div>

      {/* 5. AI Operations Insights Detail Panel */}
      {canSeeLogs && (
        webhookLogs.isLoading ? (
          <Skeleton className="h-[220px]" />
        ) : (
          <AIInsightsPanel
            averageConfidence={formatConfidence(averageConfidence)}
            criticalDetections={aiAnalyses.filter((analysis) => analysis?.severity === "CRITICAL").length}
            generatedIncidents={aiCreatedIncidents.length}
            latestAnalysis={aiAnalyses.length > 0 ? aiAnalyses[0] : null}
          />
        )
      )}

      {/* 6. Recent Webhook Log Stream */}
      {canSeeLogs && (
        webhookLogs.isLoading ? (
          <Skeleton className="h-[180px]" />
        ) : (
          <WebhookLogsTable logs={webhookLogs.data ?? []} />
        )
      )}
    </div>
  );
}
