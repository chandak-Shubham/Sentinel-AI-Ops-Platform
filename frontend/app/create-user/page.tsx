"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/services/api";
import { useRoles, useTeams } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

const schema = z
  .object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    team_id: z.coerce.number().min(1, "Team is required"),
    role_id: z.coerce.number().nullable()
  })
  .superRefine((values, ctx) => {
    if (values.role_id === null) return;
    if (!values.role_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["role_id"], message: "Role is required" });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function CreateUserPage() {
  const router = useRouter();
  const teams = useTeams();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", email: "", password: "", team_id: 0, role_id: null }
  });
  const teamId = form.watch("team_id");
  const roles = useRoles(teamId || undefined);
  const selectedTeam = teams.data?.find((team) => team.id === teamId);
  const isAdmin = selectedTeam?.name.toLowerCase() === "admin";
  const roleOptions = roles.data ?? [];

  useEffect(() => {
    form.setValue("role_id", isAdmin || roleOptions.length === 0 ? null : form.getValues("role_id"));
  }, [form, isAdmin, roleOptions.length, teamId]);

  const mutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      router.push("/login");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to create user")
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle>Create User</CardTitle>
          <CardDescription>Teams and roles are loaded from the FastAPI backend.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) => {
              if (!isAdmin && roleOptions.length > 0 && !values.role_id) {
                form.setError("role_id", { message: "Role is required" });
                return;
              }
              mutation.mutate({ ...values, role_id: isAdmin ? null : values.role_id });
            })}
          >
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" {...form.register("full_name")} />
              {form.formState.errors.full_name && <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Team</Label>
              {teams.isLoading ? (
                <Skeleton className="h-10" />
              ) : (
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
              )}
              {form.formState.errors.team_id && <p className="text-sm text-destructive">{form.formState.errors.team_id.message}</p>}
            </div>
            {!isAdmin && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Controller
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <Select
                      disabled={!teamId || roles.isLoading || roleOptions.length === 0}
                      value={field.value ? String(field.value) : ""}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={roles.isLoading ? "Loading roles" : "Select role"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.role_id && <p className="text-sm text-destructive">{form.formState.errors.role_id.message}</p>}
              </div>
            )}
            {isAdmin && <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground sm:col-span-2">Admin has no role in the backend mapping. The request will submit role_id as null.</p>}
            <div className="flex items-center justify-between gap-3 sm:col-span-2">
              <Link className="text-sm text-muted-foreground hover:text-foreground" href="/login">
                Already have an account?
              </Link>
              <Button disabled={mutation.isPending || teams.isLoading || roles.isFetching}>
                {mutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
