"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateIncident, useTeams } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(5, "Description is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  team_id: z.coerce.number().min(1, "Team is required")
});

type FormValues = z.infer<typeof schema>;

export function IncidentForm({ onSuccess, submitLabel = "Create Incident" }: { onSuccess?: () => void; submitLabel?: string }) {
  const teams = useTeams();
  const createIncident = useCreateIncident();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", severity: "MEDIUM", team_id: 0 }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        createIncident.mutate(values, {
          onSuccess: () => {
            toast.success("Incident created");
            form.reset();
            onSuccess?.();
          },
          onError: (error: Error) => toast.error(error.message || "Unable to create incident")
        })
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} />
        {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} />
        {form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Severity</Label>
          <Controller
            control={form.control}
            name="severity"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Team</Label>
          <Controller
            control={form.control}
            name="team_id"
            render={({ field }) => (
              <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.data?.map((team) => (
                    <SelectItem key={team.id} value={String(team.id)}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {form.formState.errors.team_id && <p className="text-sm text-destructive">{form.formState.errors.team_id.message}</p>}
        </div>
      </div>
      <Button className="w-full" disabled={createIncident.isPending}>
        {createIncident.isPending ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
