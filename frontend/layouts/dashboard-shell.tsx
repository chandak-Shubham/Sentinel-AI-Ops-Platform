"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Bell, ChevronLeft, ChevronRight, LogOut, Menu, Search, ScrollText, Settings, ShieldAlert, UserRound, Users, Webhook, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useIncidentRealtime } from "@/hooks/use-incident-realtime";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/dashboard/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/dashboard/activity-logs", label: "Activity Logs", icon: ScrollText },
  { href: "/dashboard/webhook-logs", label: "Webhook Logs", icon: Webhook },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useIncidentRealtime();

  const sidebar = (
    <aside className={cn("flex h-full flex-col border-r bg-card transition-all", collapsed ? "w-20" : "w-72")}>
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          {!collapsed && <span>Sentinel</span>}
        </div>
        <Button className="hidden lg:inline-flex" variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)} title="Collapse sidebar">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
                active && "bg-primary/12 text-primary"
              )}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 rounded-md border bg-background p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
              <UserRound className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{auth.profile?.email ?? "Sentinel user"}</p>
              <p className="text-xs text-muted-foreground">{auth.profile?.role ?? "Operator"}</p>
            </div>
          </div>
        )}
        <Button
          className={cn("w-full", collapsed ? "px-0" : "justify-start")}
          variant="ghost"
          title="Logout"
          onClick={() => {
            auth.logout();
            router.push("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 hidden lg:block">{sidebar}</div>
      {open && <div className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}
      <div className={cn("fixed inset-y-0 left-0 z-50 transition-transform lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</div>
      <div className={cn("transition-all", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="outline" size="icon" onClick={() => setOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">Incident Operations</p>
              <p className="text-xs text-muted-foreground">{auth.profile?.email ?? "Authenticated session"}</p>
            </div>
          </div>
          <div className="mx-4 hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                placeholder="Search incidents, users, logs..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" title="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
            <span className="hidden h-9 w-9 items-center justify-center rounded-full border bg-card text-xs font-semibold sm:flex">
              {(auth.profile?.email ?? "SU").slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
