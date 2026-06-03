"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Bell, LogOut, Menu, MessageSquare, ScrollText, Settings, ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useIncidentRealtime } from "@/hooks/use-incident-realtime";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/dashboard/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
  { href: "/dashboard/team-chat", label: "Team Chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  useIncidentRealtime();

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r bg-card">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          Sentinel AI
        </div>
        <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-primary/12 text-primary"
              )}
              href={item.href}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button
          className="w-full justify-start"
          variant="ghost"
          onClick={() => {
            auth.logout();
            router.push("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 hidden lg:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <div className={cn("fixed inset-y-0 left-0 z-50 transition-transform lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</div>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="outline" size="icon" onClick={() => setOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-sm font-medium">Incident Operations</p>
              <p className="text-xs text-muted-foreground">{auth.profile?.email ?? "Authenticated session"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" title="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
