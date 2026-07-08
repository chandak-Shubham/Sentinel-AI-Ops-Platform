"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  });

  const mutation = useMutation({
    mutationFn: api.login,
    onSuccess: (data) => {
      auth.login(data.access_token);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    },
    onError: (error: Error) => toast.error(error.message || "Unable to login")
  });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding/Hero (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-zinc-900 p-12 text-white">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">Sentinel AI</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Protect and Monitor with Confidence.
          </h1>
          <p className="text-lg text-zinc-400">
            Advanced RBAC, intelligent AI log analysis, and seamless incident management all in one place.
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Sentinel AI. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-4 sm:px-12 xl:px-24">
        {/* Header navigation for mobile & theme toggle */}
        <div className="absolute top-6 left-6 flex lg:hidden items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">Sentinel AI</span>
        </div>
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 mt-12 lg:mt-0">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email" 
                placeholder="name@example.com"
                {...form.register("email")} 
                className="h-11"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                autoComplete="current-password" 
                placeholder="••••••••"
                {...form.register("password")} 
                className="h-11"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button className="w-full h-11 text-base font-medium mt-2" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
