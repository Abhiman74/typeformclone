"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { FileQuestion, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { FormCard } from "@/components/dashboard/form-card";
import { CreateFormDialog } from "@/components/dashboard/create-form-dialog";
import { RenameFormDialog } from "@/components/dashboard/rename-form-dialog";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { useForms } from "@/hooks/use-forms";
import type { FormListItem } from "@/types";

export default function DashboardPage() {
  const { data: forms, isLoading, isError } = useForms();
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<FormListItem | null>(null);

  const filtered = React.useMemo(() => {
    if (!forms) return [];
    const q = search.trim().toLowerCase();
    if (!q) return forms;
    return forms.filter((f) => f.title.toLowerCase().includes(q));
  }, [forms, search]);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your forms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Build, publish, and analyze conversational forms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create form
          </Button>
        </div>
      </header>

      <div className="mb-6 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search forms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading && <DashboardSkeleton />}

      {isError && (
        <EmptyState
          icon={FileQuestion}
          title="Couldn't load your forms"
          description="Make sure the API server is running at the configured NEXT_PUBLIC_API_URL."
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={FileQuestion}
          title={search ? "No forms match your search" : "No forms yet"}
          description={
            search ? "Try a different search term." : "Create your first form to get started."
          }
          action={
            !search && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Create form
              </Button>
            )
          }
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((form) => (
              <FormCard key={form.id} form={form} onRename={setRenameTarget} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <CreateFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <RenameFormDialog form={renameTarget} open={Boolean(renameTarget)} onOpenChange={(o) => !o && setRenameTarget(null)} />
    </div>
  );
}
