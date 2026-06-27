"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTeams } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/state-views";

export default function UsersPage() {
  const auth = useAuth();
  const teams = useTeams();
  const [search, setSearch] = useState("");
  const rows = useMemo(() => {
    const currentUser = auth.profile?.email
      ? [{
          id: auth.profile.user_id ?? 0,
          name: auth.profile.email.split("@")[0],
          email: auth.profile.email,
          role: auth.profile.role ?? "Operator",
          team: "Current team",
          status: "Active"
        }]
      : [];
    return currentUser.filter((user) => `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(search.toLowerCase()));
  }, [auth.profile, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage operators, roles, and team access.</p>
        </div>
        <Link href="/create-user">
          <Button>
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {teams.isLoading ? <Skeleton className="h-5" /> : `${teams.data?.length ?? 0} teams available`}
          </div>
        </CardContent>
      </Card>
      {rows.length === 0 ? (
        <EmptyState title="No users found" description="A dedicated users list endpoint can plug into this table when available." />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                        {user.name.slice(0, 2).toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.team}</TableCell>
                    <TableCell><Badge variant="low">{user.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
