"use client";

import { motion } from "framer-motion";
import { ArrowUp, CornerDownLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuestionRenderer } from "@/components/respondent/question-renderer";
import type { FlowQuestion, FlowValue } from "@/components/respondent/types";
import { cn } from "@/lib/utils";

const slideVariants = {
  enter: (direction: number) => ({ y: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? -40 : 40, opacity: 0 }),
};

interface QuestionScreenProps {
  question: FlowQuestion;
  index: number;
  total: number;
  direction: number;
  value: FlowValue;
  error: string | null;
  isLast: boolean;
  isSubmitting: boolean;
  onChange: (value: FlowValue) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function QuestionScreen({
  question,
  index,
  total,
  direction,
  value,
  error,
  isLast,
  isSubmitting,
  onChange,
  onNext,
  onPrev,
}: QuestionScreenProps) {
  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24 sm:px-0"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background sm:mt-2.5">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="respondent-question-title">
            {question.title}
            {question.required && <span className="ml-1 text-primary">*</span>}
          </h1>

          {question.description && (
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">{question.description}</p>
          )}

          <div className="mt-8">
            <QuestionRenderer
              question={question}
              value={value}
              onChange={onChange}
              onAdvance={onNext}
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm font-medium text-destructive"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-10 flex items-center gap-3">
            <Button onClick={onNext} disabled={isSubmitting} size="lg" className="gap-2">
              {isLast ? "Submit" : "OK"}
              {!isSubmitting && <CornerDownLeft className="size-4" />}
            </Button>
            {index > 0 && (
              <Button variant="ghost" onClick={onPrev} className="text-muted-foreground">
                <ArrowUp className="size-4" />
              </Button>
            )}
            <span className={cn("hidden text-xs text-muted-foreground sm:inline")}>
              press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Enter ↵</kbd>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
