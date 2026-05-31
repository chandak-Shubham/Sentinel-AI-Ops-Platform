import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell } from "@/layouts/dashboard-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
