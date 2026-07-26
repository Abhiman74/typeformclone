"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateForm } from "@/hooks/use-forms";

export function CreateFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = React.useState("");
  const router = useRouter();
  const createForm = useCreateForm();

  const handleCreate = () => {
    createForm.mutate(title.trim() || "Untitled Form", {
      onSuccess: (form) => {
        onOpenChange(false);
        setTitle("");
        router.push(`/builder/${form.id}`);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
          <DialogDescription>Give your form a name -- you can change it any time.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="form-title">Form title</Label>
          <Input
            id="form-title"
            autoFocus
            placeholder="e.g. Customer Feedback"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={createForm.isPending}>
            {createForm.isPending && <Loader2 className="size-4 animate-spin" />}
            Create form
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
