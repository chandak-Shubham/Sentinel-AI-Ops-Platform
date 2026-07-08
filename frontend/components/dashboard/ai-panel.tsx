import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lightbulb, ShieldAlert, Cpu } from "lucide-react";

interface AIAnalysis {
  summary: string;
  root_cause: string;
  recommendations: string[];
}

interface AIInsightsPanelProps {
  averageConfidence: string | number;
  criticalDetections: number;
  generatedIncidents: number;
  latestAnalysis?: AIAnalysis | null;
}

export function AIInsightsPanel({
  averageConfidence,
  criticalDetections,
  generatedIncidents,
  latestAnalysis,
}: AIInsightsPanelProps) {
  const metrics = [
    { label: "AI Pipeline Confidence", value: averageConfidence, icon: Cpu },
    { label: "Critical AI Detections", value: criticalDetections, icon: ShieldAlert },
    { label: "Automated Incident Creation", value: generatedIncidents, icon: Bot },
  ];

  return (
    <Card className="ai-glow-card glass-card hover:border-primary/20 duration-300">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-primary">
          <Bot className="h-5 w-5 animate-pulse-slow" />
          AI Incident Operations Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 space-y-6">
        {/* Metric Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-xl border border-border/40 bg-background/50 p-4 flex items-center justify-between shadow-soft hover:bg-background/80 transition-colors"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-foreground">{m.value}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Cards */}
        {latestAnalysis ? (
          <div className="grid gap-4 md:grid-cols-2 pt-1">
            <div className="rounded-xl border border-border/50 bg-secondary/5 p-5 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">Latest Analysis Summary</p>
                <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{latestAnalysis.summary}</p>
              </div>
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Root Cause Diagnostics</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{latestAnalysis.root_cause}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-secondary/5 p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Tactical Recommendations
                </p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {latestAnalysis.recommendations.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex gap-2.5 items-start leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border/40 bg-secondary/5 p-6 text-center text-sm text-muted-foreground">
            No live webhook logs or AI recommendations detected on this channel yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
