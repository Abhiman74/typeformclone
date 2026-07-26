"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateForm } from "@/hooks/use-forms";
import type { FormListItem } from "@/types";

export function RenameFormDialog({
  form,
  open,
  onOpenChange,
}: {
  form: FormListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = React.useState(form?.title ?? "");
  const updateForm = useUpdateForm(form?.id ?? "");

  // This dialog is a single shared instance whose `form` prop swaps
  // identity each time a different card's "Rename" is clicked -- reset the
  // buffer during render when that happens (see BuilderHeader for the same
  // pattern with a rationale link).
  const [syncedFormId, setSyncedFormId] = React.useState(form?.id ?? null);
  if ((form?.id ?? null) !== syncedFormId) {
    setSyncedFormId(form?.id ?? null);
    setTitle(form?.title ?? "");
  }

  if (!form) return null;

  const handleRename = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateForm.mutate({ title: trimmed }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename form</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rename-title">Form title</Label>
          <Input
            id="rename-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRename} disabled={updateForm.isPending}>
            {updateForm.isPending && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
