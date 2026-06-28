import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { DashboardRealtimeProvider } from "@/providers/realtime-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardRealtimeProvider>
        <DashboardShell>{children}</DashboardShell>
      </DashboardRealtimeProvider>
    </AuthGuard>
  );
}
