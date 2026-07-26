"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { RespondentFlow } from "@/components/respondent/respondent-flow";
import type { Question } from "@/types";

export function PreviewModal({
  open,
  onOpenChange,
  title,
  questions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  questions: Question[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="h-[90vh] max-w-4xl overflow-hidden rounded-2xl p-0 sm:h-[85vh]"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {questions.length > 0 ? (
            <RespondentFlow formTitle={title} questions={questions} onSubmit={async () => {}} preview />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              Add a question to preview your form.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
