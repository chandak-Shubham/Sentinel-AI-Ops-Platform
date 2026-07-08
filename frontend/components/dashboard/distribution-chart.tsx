import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SeverityDistributionChartProps {
  data: Array<{ severity?: string | null }>;
}

export function SeverityDistributionChart({ data }: SeverityDistributionChartProps) {
  const critical = data.filter((item) => (item.severity ?? "").toLowerCase() === "critical").length;
  const high = data.filter((item) => (item.severity ?? "").toLowerCase() === "high").length;
  const medium = data.filter((item) => (item.severity ?? "").toLowerCase() === "medium").length;
  const low = data.filter((item) => (item.severity ?? "").toLowerCase() === "low" || !(item.severity)).length;

  const total = critical + high + medium + low || 1; // avoid division by zero

  const segments = [
    { label: "Critical", count: critical, color: "stroke-red-500 text-red-500", bg: "bg-red-500" },
    { label: "High", count: high, color: "stroke-orange-500 text-orange-500", bg: "bg-orange-500" },
    { label: "Medium", count: medium, color: "stroke-amber-500 text-amber-500", bg: "bg-amber-500" },
    { label: "Low", count: low, color: "stroke-emerald-500 text-emerald-500", bg: "bg-emerald-500" },
  ];

  // Circle properties
  const radius = 35;
  const circumference = 2 * Math.PI * radius; // ~220
  let accumulatedPercent = 0;

  return (
    <Card className="hover:border-primary/20 duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-foreground">Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
          {/* SVG Donut */}
          <div className="relative w-[120px] h-[120px]">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                className="text-muted/20"
                strokeWidth="12"
              />
              {data.length > 0 && segments.map((seg) => {
                const percent = seg.count / total;
                if (percent === 0) return null;

                const strokeLength = percent * circumference;
                const strokeOffset = circumference - (accumulatedPercent * circumference);
                accumulatedPercent += percent;

                return (
                  <circle
                    key={seg.label}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    className={`${seg.color} transition-all duration-500`}
                    strokeWidth="12"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-foreground">{data.length}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Alerts</span>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="flex-1 space-y-2.5 w-full max-w-[180px]">
            {segments.map((seg) => {
              const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
              return (
                <div key={seg.label} className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${seg.bg}`} />
                    <span className="text-muted-foreground">{seg.label}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-foreground">{seg.count}</span>
                    <span className="text-muted-foreground/60 w-8 text-right">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
