import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface IncidentTrendChartProps {
  data: Array<{ created_at?: string | null }>;
}

export function IncidentTrendChart({ data }: IncidentTrendChartProps) {
  const { resolvedTheme } = useTheme();
  
  // Calculate counts for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const dayLabels = last7Days.map((d) =>
    d.toLocaleDateString("en-US", { weekday: "short" })
  );

  const counts = last7Days.map((date) => {
    const dayStr = date.toDateString();
    return data.filter((item) => item.created_at && new Date(item.created_at).toDateString() === dayStr).length;
  });

  const maxVal = Math.max(...counts, 5);
  const width = 500;
  const height = 150;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Generate chart coordinates
  const points = counts.map((count, i) => {
    const x = paddingLeft + (i / 6) * chartWidth;
    const y = paddingTop + chartHeight - (count / maxVal) * chartHeight;
    return { x, y, count };
  });

  // Create SVG path string
  const linePath = points.reduce((path, p, i) => {
    return path + `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
  }, "");

  // Create Area path (closed at the bottom)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  return (
    <Card className="hover:border-primary/20 duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-foreground">Incident Volume (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[160px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + ratio * chartHeight;
              const val = Math.round(maxVal * (1 - ratio));
              return (
                <g key={ratio} className="opacity-40">
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    className="text-border"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-medium fill-muted-foreground"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area under the line */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {/* Trend Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-500"
              />
            )}

            {/* Data Points */}
            {points.map((p, i) => (
              <g key={i} className="group/point">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  className="fill-background stroke-primary stroke-[2] cursor-pointer hover:r-[6] transition-all duration-200"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="12"
                  className="fill-transparent cursor-pointer"
                />
                {/* Micro tooltip */}
                <title>{`${p.count} incidents`}</title>
              </g>
            ))}

            {/* X-Axis labels */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] font-bold fill-muted-foreground"
              >
                {dayLabels[i]}
              </text>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
