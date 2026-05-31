import { AlertCircle, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <div className="font-medium">{title}</div>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive/40">
      <CardContent className="flex items-center gap-3 py-6 text-sm text-destructive">
        <AlertCircle className="h-5 w-5" />
        {message}
      </CardContent>
    </Card>
  );
}
