"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";

export function DemoLoginButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/auth/demo-login`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start demo");
      }

      const data = await response.json();
      login(data.access_token);
      toast.success("Welcome to the Sentinel AI Demo!");
      setIsOpen(false);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start demo. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="h-12 px-8 text-base">
          <Play className="mr-2 h-4 w-4" />
          View Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sentinel AI Demo</DialogTitle>
          <DialogDescription>
            You are about to enter a demo environment. You will be logged in as a guest user with System Admin privileges.
            Your session will automatically expire after 30 minutes.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This is a shared environment intended for exploration. Please do not submit any sensitive information.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleDemoLogin} disabled={isLoading}>
            {isLoading ? "Starting..." : "Proceed to Demo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
