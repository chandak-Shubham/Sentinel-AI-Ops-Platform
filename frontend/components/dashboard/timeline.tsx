import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/state-views";

interface TimelineEntry {
  id: string;
  action: string;
  actor: string;
  time: string;
}

interface ActivityTimelineProps {
  timeline: TimelineEntry[];
}

export function ActivityTimeline({ timeline }: ActivityTimelineProps) {
  return (
    <Card className="hover:border-primary/20 duration-300 xl:sticky xl:top-[88px]">
      <CardHeader>
        <CardTitle className="text-base font-bold">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {timeline.length === 0 ? (
          <EmptyState title="No activity yet" description="Incident and log activity will appear here." />
        ) : (
          <div className="relative flex flex-col gap-4">
            {timeline.map((entry, idx) => (
              <div key={entry.id} className="relative flex gap-4">
                {idx < timeline.length - 1 && (
                  <div className="absolute left-[17px] top-10 bottom-0 w-0.5 bg-border/45" />
                )}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold shadow-sm">
                  {entry.actor.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1 bg-secondary/10 hover:bg-secondary/25 rounded-xl p-3.5 border border-border/40 transition-all duration-200">
                  <p className="text-sm font-semibold text-foreground leading-relaxed">{entry.action}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                    <span className="text-primary/95">{entry.actor}</span>
                    <span>{entry.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
