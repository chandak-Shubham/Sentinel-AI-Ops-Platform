import { Badge } from "@/components/ui/badge";

export function SeverityBadge({ value }: { value?: string | null }) {
  const normalized = (value ?? "LOW").toLowerCase();
  const variant = normalized === "critical" ? "critical" : normalized === "high" ? "high" : normalized === "medium" ? "medium" : "low";
  return <Badge variant={variant}>{(value ?? "LOW").toUpperCase()}</Badge>;
}

export function StatusBadge({ value }: { value?: string | null }) {
  const text = (value ?? "OPEN").toUpperCase();
  const tone = text === "RESOLVED" || text === "CLOSED" ? "low" : text === "IN_PROGRESS" ? "medium" : "high";
  return <Badge variant={tone}>{text}</Badge>;
}

export function LogLevelBadge({ value }: { value?: string | null }) {
  const text = (value ?? "INFO").toUpperCase();
  const tone = text === "CRITICAL" ? "critical" : text === "ERROR" ? "high" : text === "WARNING" ? "medium" : "low";
  return <Badge variant={tone}>{text}</Badge>;
}
