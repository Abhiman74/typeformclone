"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Link2, Radio, RadioTower } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { AutosaveIndicator } from "@/components/builder/autosave-indicator";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { AutosaveStatus } from "@/hooks/use-autosave-status";
import type { FormDetail } from "@/types";

interface BuilderHeaderProps {
  form: FormDetail;
  autosaveStatus: AutosaveStatus;
  onTitleChange: (title: string) => void;
  onTogglePublish: () => void;
  onOpenPreview: () => void;
}

export function BuilderHeader({
  form,
  autosaveStatus,
  onTitleChange,
  onTogglePublish,
  onOpenPreview,
}: BuilderHeaderProps) {
  const [title, setTitle] = React.useState(form.title);
  const [confirmUnpublish, setConfirmUnpublish] = React.useState(false);

  // Keep the input in sync if `form.title` changes from outside this
  // component (e.g. renamed from the dashboard in another tab). Adjusting
  // state directly during render -- rather than in an effect -- avoids an
  // extra commit-then-rerender cycle; see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [syncedTitle, setSyncedTitle] = React.useState(form.title);
  if (form.title !== syncedTitle) {
    setSyncedTitle(form.title);
    setTitle(form.title);
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/form/${form.slug}` : "";

  const commitTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== form.title) onTitleChange(trimmed);
    else setTitle(form.title);
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="max-w-xs border-none px-1 text-base font-medium shadow-none focus-visible:ring-0"
        />
        <StatusBadge status={form.status} />
        <AutosaveIndicator status={autosaveStatus} />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" onClick={onOpenPreview} className="gap-1.5">
          <Eye className="size-4" />
          Preview
        </Button>
        {form.status === "published" && (
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl);
              toast.success("Shareable link copied to clipboard");
            }}
          >
            <Link2 className="size-4" />
            Copy link
          </Button>
        )}
        <Button
          onClick={() => (form.status === "published" ? setConfirmUnpublish(true) : onTogglePublish())}
          className="gap-1.5"
        >
          {form.status === "published" ? (
            <>
              <Radio className="size-4" /> Unpublish
            </>
          ) : (
            <>
              <RadioTower className="size-4" /> Publish
            </>
          )}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Unpublish this form?"
        description="The shareable link will stop accepting new responses until you publish again. Existing responses are kept."
        confirmLabel="Unpublish"
        onConfirm={onTogglePublish}
      />
    </header>
  );
}
