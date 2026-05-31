import Link from "next/link";
import { Activity, LogIn, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_28%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)))]">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            Sentinel AI
          </div>
          <ThemeToggle />
        </header>
        <section className="flex flex-1 items-center justify-center py-16">
          <div className="max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-card shadow-sm">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-semibold tracking-normal sm:text-6xl">Sentinel AI</h1>
            <p className="mt-5 text-lg text-muted-foreground">
              A focused incident command center for teams that need clarity, accountability, and fast response.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link className={cn(buttonVariants())} href="/create-user">
                <UserPlus className="h-4 w-4" />
                Create User
              </Link>
              <Link className={cn(buttonVariants({ variant: "outline" }))} href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
