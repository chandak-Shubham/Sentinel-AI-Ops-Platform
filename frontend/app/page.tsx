"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, CheckCircle2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

const createUserSchema = z
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

type LoginValues = z.infer<typeof loginSchema>;
type CreateUserValues = z.infer<typeof createUserSchema>;

export default function LandingPage() {
  const router = useRouter();
  const auth = useAuth();
  const [mode, setMode] = useState<"login" | "create">("login");

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { full_name: "", email: "", password: "", team_id: 0, role_id: null }
  });

  const teams = useQuery({ queryKey: ["teams"], queryFn: api.teams, enabled: mode === "create" });
  const teamId = createForm.watch("team_id");
  const roles = useQuery({
    queryKey: ["roles", teamId],
    queryFn: () => api.rolesByTeam(teamId),
    enabled: mode === "create" && Boolean(teamId)
  });
  const selectedTeam = teams.data?.find((team) => team.id === teamId);
  const isAdmin = selectedTeam?.name.toLowerCase() === "admin";
  const roleOptions = roles.data ?? [];

  useEffect(() => {
    if (mode !== "create") return;
    createForm.setValue("role_id", isAdmin || roleOptions.length === 0 ? null : createForm.getValues("role_id"));
  }, [createForm, isAdmin, mode, roleOptions.length, teamId]);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      auth.login(data.access_token);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to login")
  });

  const createMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      createForm.reset();
      setMode("login");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to create user")
  });

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,hsl(var(--border)/0.72)_1px,transparent_1px),linear-gradient(0deg,hsl(var(--border)/0.72)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_0%,black_52%,transparent_84%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,hsl(var(--primary)/0.24)_1px,transparent_1px),linear-gradient(0deg,hsl(var(--primary)/0.24)_1px,transparent_1px)] bg-[size:128px_128px] [mask-image:radial-gradient(circle_at_center,black_0%,transparent_58%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[min(86vw,760px)] w-[min(86vw,760px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.16)_0%,hsl(var(--accent)/0.08)_36%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.18),hsl(var(--background)/0.82)_88%)]" />

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-12">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            {/* <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
              <Activity className="h-6 w-6" />
            </span> */}
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">Incident response</p>
              <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl lg:text-6xl">Sentinel AI</h1>
            </div>
          </div>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            A focused command center for teams that need clear incident ownership, fast response, and reliable operational visibility.
          </p>

          {/* <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
            <div className="rounded-md border bg-card/82 p-4 shadow-sm backdrop-blur">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium">Secure access</p>
            </div>
            <div className="rounded-md border bg-card/82 p-4 shadow-sm backdrop-blur">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium">Team ready</p>
            </div>
            <div className="rounded-md border bg-card/82 p-4 shadow-sm backdrop-blur">
              <Activity className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium">Live response</p>
            </div>
          </div> */}
        </div>

        <div className="w-full justify-self-center lg:justify-self-end">
          <div className="rounded-lg border bg-card/94 p-5 shadow-xl shadow-foreground/5 backdrop-blur sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">{mode === "login" ? "Welcome back" : "New account"}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">{mode === "login" ? "Login" : "Create user"}</h2>
              </div>
              <div className="grid grid-cols-2 rounded-md border bg-muted p-1">
                <Button type="button" size="sm" variant={mode === "login" ? "default" : "ghost"} onClick={() => setMode("login")}>
                  Login
                </Button>
                <Button type="button" size="sm" variant={mode === "create" ? "default" : "ghost"} onClick={() => setMode("create")}>
                  Create
                </Button>
              </div>
            </div>

            {mode === "login" ? (
              <form className="space-y-4" onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}>
                <div className="space-y-2">
                  <Label htmlFor="landing-email">Email</Label>
                  <Input id="landing-email" type="email" autoComplete="email" {...loginForm.register("email")} />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landing-password">Password</Label>
                  <Input id="landing-password" type="password" autoComplete="current-password" {...loginForm.register("password")} />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                </div>
                <Button className="h-11 w-full" disabled={loginMutation.isPending}>
                  <LogIn className="h-4 w-4" />
                  {loginMutation.isPending ? "Signing in..." : "Login"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Need an account?{" "}
                  <button className="font-medium text-primary hover:text-primary/80" type="button" onClick={() => setMode("create")}>
                    Create user
                  </button>
                </p>
              </form>
            ) : (
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={createForm.handleSubmit((values) => {
                  if (!isAdmin && roleOptions.length > 0 && !values.role_id) {
                    createForm.setError("role_id", { message: "Role is required" });
                    return;
                  }
                  createMutation.mutate({ ...values, role_id: isAdmin ? null : values.role_id });
                })}
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="landing-full-name">Full Name</Label>
                  <Input id="landing-full-name" autoComplete="name" {...createForm.register("full_name")} />
                  {createForm.formState.errors.full_name && <p className="text-sm text-destructive">{createForm.formState.errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landing-create-email">Email</Label>
                  <Input id="landing-create-email" type="email" autoComplete="email" {...createForm.register("email")} />
                  {createForm.formState.errors.email && <p className="text-sm text-destructive">{createForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landing-create-password">Password</Label>
                  <Input id="landing-create-password" type="password" autoComplete="new-password" {...createForm.register("password")} />
                  {createForm.formState.errors.password && <p className="text-sm text-destructive">{createForm.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  {teams.isLoading ? (
                    <Skeleton className="h-10" />
                  ) : (
                    <Controller
                      control={createForm.control}
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
                  {createForm.formState.errors.team_id && <p className="text-sm text-destructive">{createForm.formState.errors.team_id.message}</p>}
                </div>
                {!isAdmin && (
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Controller
                      control={createForm.control}
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
                    {createForm.formState.errors.role_id && <p className="text-sm text-destructive">{createForm.formState.errors.role_id.message}</p>}
                  </div>
                )}
                {isAdmin && <p className="rounded-md border bg-muted p-3 text-sm text-muted-foreground sm:col-span-2">Admin has no role mapping. The request submits role_id as null.</p>}
                <div className="grid gap-3 sm:col-span-2">
                  <Button className="h-11 w-full" disabled={createMutation.isPending || teams.isLoading || roles.isFetching}>
                    <UserPlus className="h-4 w-4" />
                    {createMutation.isPending ? "Creating..." : "Create User"}
                  </Button>
                  <button className="text-sm text-muted-foreground hover:text-foreground" type="button" onClick={() => setMode("login")}>
                    Already have an account? Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
