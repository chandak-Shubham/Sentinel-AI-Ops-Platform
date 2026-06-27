"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IncidentForm } from "@/features/incidents/incident-form";

export default function NewIncidentPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Incident</h1>
        <p className="text-sm text-muted-foreground">Capture a new operational issue and assign it to the right team.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>Title, description, severity, and team are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentForm onSuccess={() => router.push("/dashboard/incidents")} />
        </CardContent>
      </Card>
    </div>
  );
}
