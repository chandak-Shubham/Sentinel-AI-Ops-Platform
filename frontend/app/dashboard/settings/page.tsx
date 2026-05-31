"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Save, UserCog } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address")
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm your new password")
  })
  .refine((value) => value.new_password === value.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match"
  });

export default function SettingsPage() {
  const auth = useAuth();
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: auth.profile?.email ?? ""
    }
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile forms are ready for backend profile endpoints.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Current session details are decoded from the JWT token.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 rounded-md border p-4 text-sm">
              <Info label="Email" value={auth.profile?.email ?? "Not available"} />
              <Info label="Team" value="Not exposed by current token" />
              <Info label="Role" value={auth.profile?.role ?? "Not available"} />
            </div>
            <form
              className="space-y-4"
              onSubmit={profileForm.handleSubmit(() => toast.info("Profile update endpoint is not available in the backend yet."))}
            >
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...profileForm.register("full_name")} />
                {profileForm.formState.errors.full_name && <p className="text-sm text-destructive">{profileForm.formState.errors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...profileForm.register("email")} />
                {profileForm.formState.errors.email && <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>}
              </div>
              <Button>
                <Save className="h-4 w-4" />
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Password validation is active; persistence awaits the backend endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={passwordForm.handleSubmit(() => toast.info("Password update endpoint is not available in the backend yet."))}
            >
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input id="current_password" type="password" {...passwordForm.register("current_password")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input id="new_password" type="password" {...passwordForm.register("new_password")} />
                {passwordForm.formState.errors.new_password && <p className="text-sm text-destructive">{passwordForm.formState.errors.new_password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input id="confirm_password" type="password" {...passwordForm.register("confirm_password")} />
                {passwordForm.formState.errors.confirm_password && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirm_password.message}</p>}
              </div>
              <Button>
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
