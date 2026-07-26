"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  Copy,
  Link2,
  MoreHorizontal,
  Pencil,
  Radio,
  RadioTower,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRelativeDate } from "@/lib/format";
import { useDeleteForm, useDuplicateForm, useTogglePublish } from "@/hooks/use-forms";
import type { FormListItem } from "@/types";

interface FormCardProps {
  form: FormListItem;
  onRename: (form: FormListItem) => void;
}

export function FormCard({ form, onRename }: FormCardProps) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const duplicateForm = useDuplicateForm();
  const deleteForm = useDeleteForm();
  const togglePublish = useTogglePublish();

  const publicUrl =
    typeof window !== "undefined" ? `${window.location.origin}/form/${form.slug}` : `/form/${form.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Shareable link copied to clipboard");
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.18 }}
      >
        <Card className="group relative overflow-hidden py-0 transition-shadow hover:shadow-md">
          <Link href={`/builder/${form.id}`} className="block px-6 pt-6">
            <div className="flex items-start justify-between gap-2">
              <StatusBadge status={form.status} />
            </div>
            <h3 className="mt-3 truncate text-lg font-semibold">{form.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {form.response_count} {form.response_count === 1 ? "response" : "responses"} · Updated{" "}
              {formatRelativeDate(form.updated_at)}
            </p>
          </Link>

          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <div className="flex items-center gap-1">
              <Link href={`/builder/${form.id}`}>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              </Link>
              <Link href={`/analytics/${form.id}`}>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                  <BarChart3 className="size-3.5" />
                  Results
                </Button>
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onRename(form)}>
                  <Pencil className="size-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => duplicateForm.mutate(form.id)}>
                  <Copy className="size-4" /> Duplicate
                </DropdownMenuItem>
                {form.status === "published" && (
                  <DropdownMenuItem onSelect={copyLink}>
                    <Link2 className="size-4" /> Copy share link
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    togglePublish.mutate({ id: form.id, publish: form.status !== "published" })
                  }
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
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                  <Trash2 className="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </motion.div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this form?"
        description={`"${form.title}" and all ${form.response_count} of its responses will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete form"
        onConfirm={() => deleteForm.mutate(form.id)}
      />
    </>
  );
}
