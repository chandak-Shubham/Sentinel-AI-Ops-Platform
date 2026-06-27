"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { IncidentForm } from "@/features/incidents/incident-form";

export function CreateIncidentDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Create Incident
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Incident</DialogTitle>
          <DialogDescription>New incidents are written to the FastAPI backend and remain part of the historical record.</DialogDescription>
        </DialogHeader>
        <IncidentForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
