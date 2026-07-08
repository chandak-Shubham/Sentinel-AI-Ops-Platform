import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SeverityBadge, StatusBadge } from "@/components/status-badges";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/state-views";
import { Incident } from "@/types/api";

interface RecentIncidentsTableProps {
  items: Incident[];
}

export function RecentIncidentsTable({ items }: RecentIncidentsTableProps) {
  return (
    <div className="flex flex-col">
      {items.length === 0 ? (
        <EmptyState title="No incidents" description="Incidents created through the backend will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.slice(0, 6).map((incident) => (
              <TableRow key={incident.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="py-3.5">
                  <Link className="font-semibold text-primary hover:underline" href={`/dashboard/incidents/${incident.id}`}>
                    {incident.title}
                  </Link>
                </TableCell>
                <TableCell className="py-3.5"><SeverityBadge value={incident.severity} /></TableCell>
                <TableCell className="py-3.5"><StatusBadge value={incident.status} /></TableCell>
                <TableCell className="py-3.5 text-muted-foreground text-sm font-semibold">
                  {incident.assigned_to ? `User ${incident.assigned_to}` : "Unassigned"}
                </TableCell>
                <TableCell className="py-3.5 text-muted-foreground text-sm">{formatDate(incident.created_at)}</TableCell>
                <TableCell className="py-3.5 text-right">
                  <Link
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    href={`/dashboard/incidents/${incident.id}`}
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
