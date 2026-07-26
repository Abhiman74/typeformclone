"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/respondent/question-renderer";
import type { FlowValue } from "@/components/respondent/types";
import type { Question } from "@/types";

/** Renders one question's live preview card. Mounted with `key={question.id}`
 * by the parent, so switching questions remounts this fresh -- local
 * `value` state naturally resets with no synchronization effect needed. */
function LivePreviewCard({ question }: { question: Question }) {
  const [value, setValue] = React.useState<FlowValue>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <p className="text-xs font-medium text-primary">Question {question.position + 1}</p>
      <h3 className="respondent-question-title mt-1 text-xl! sm:text-2xl!">
        {question.title || "Untitled question"}
        {question.required && <span className="ml-1 text-primary">*</span>}
      </h3>
      {question.description && (
        <p className="mt-2 text-sm text-muted-foreground">{question.description}</p>
      )}
      <div className="mt-5">
        <QuestionRenderer question={question} value={value} onChange={setValue} onAdvance={() => {}} />
      </div>
    </motion.div>
  );
}

/**
 * Right-hand "everything updates instantly" pane: a scaled-down device
 * frame rendering exactly what a respondent would see for the question
 * currently selected in the editor. Local-only interaction (typing/
 * selecting) lets the builder sanity-check an input without writing to
 * the database -- that's what the full-screen "Preview" modal is for.
 */
export function LivePreview({
  question,
  onOpenFullPreview,
}: {
  question: Question | null;
  onOpenFullPreview: () => void;
}) {
  return (
    <aside className="flex h-full w-96 shrink-0 flex-col border-l border-border bg-muted/30 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Live preview</h2>
        <Button variant="outline" size="sm" onClick={onOpenFullPreview} className="gap-1.5">
          <Maximize2 className="size-3.5" />
          Full preview
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-background p-6 shadow-sm">
        <AnimatePresence mode="wait">
          {question ? (
            <LivePreviewCard key={question.id} question={question} />
          ) : (
            <p className="text-sm text-muted-foreground">Select a question to preview it.</p>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
