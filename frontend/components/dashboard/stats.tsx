import { Card, CardContent } from "@/components/ui/card";
import { ListChecks, AlertTriangle, Siren, CheckCircle2, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
  isLoading: boolean;
  total: number;
  open: number;
  critical: number;
  resolved: number;
}

export function DashboardStats({ isLoading, total, open, critical, resolved }: DashboardStatsProps) {
  const cards = [
    {
      label: "Total Incidents",
      value: total,
      subtitle: "Lifetime tracked events",
      icon: ListChecks,
      trend: { text: "Stable load", type: "neutral" as const },
      color: "text-primary bg-primary/10 border-primary/20",
    },
    {
      label: "Open Incidents",
      value: open,
      subtitle: "Requiring active response",
      icon: AlertTriangle,
      trend: open > 10 ? { text: "High queue", type: "down" as const } : { text: "Healthy queue", type: "up" as const },
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Critical Incidents",
      value: critical,
      subtitle: "Service impacting outages",
      icon: Siren,
      trend: critical > 0 ? { text: "Active alerts", type: "down" as const } : { text: "Zero critical", type: "up" as const },
      color: "text-red-500 bg-red-500/10 border-red-500/20",
    },
    {
      label: "Resolved Today",
      value: resolved,
      subtitle: "Mitigated in current cycle",
      icon: CheckCircle2,
      trend: resolved > 0 ? { text: "Active cleanup", type: "up" as const } : { text: "No recent closures", type: "neutral" as const },
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="hover:-translate-y-1 hover:shadow-soft hover:border-primary/20 duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p className="text-3xl font-extrabold tracking-tight">{card.value}</p>
                )}
                <div className="flex items-center gap-1.5">
                  {card.trend.type === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                  {card.trend.type === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                  {card.trend.type === "neutral" && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                  <span className="text-[10px] font-semibold text-muted-foreground/90">{card.trend.text}</span>
                </div>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.color} shadow-sm`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
