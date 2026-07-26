"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

import { RespondentProgressBar } from "@/components/respondent/progress-bar";
import { QuestionScreen } from "@/components/respondent/question-screen";
import { ThankYouScreen } from "@/components/respondent/thank-you-screen";
import type { FlowQuestion, FlowValue } from "@/components/respondent/types";

const CHOICE_LIKE = new Set(["multiple_choice", "dropdown", "yes_no", "rating"]);

function isEmpty(value: FlowValue): boolean {
  return value === null || value === undefined || value === "";
}

function validate(question: FlowQuestion, value: FlowValue): string | null {
  if (question.required && isEmpty(value)) {
    return "This question requires an answer.";
  }
  if (!isEmpty(value) && question.type === "email") {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
    if (!ok) return "Please enter a valid email address.";
  }
  return null;
}

interface RespondentFlowProps {
  formTitle: string;
  questions: FlowQuestion[];
  onSubmit: (answers: { question_id: string; value: FlowValue }[]) => Promise<void>;
  /** Preview mode skips the real network submit and shows a banner. */
  preview?: boolean;
}

export function RespondentFlow({ formTitle, questions, onSubmit, preview }: RespondentFlowProps) {
  const ordered = React.useMemo(() => [...questions].sort((a, b) => a.position - b.position), [questions]);

  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const [answers, setAnswers] = React.useState<Record<string, FlowValue>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const current = ordered[index];
  const isLast = index === ordered.length - 1;

  const goNext = React.useCallback(async () => {
    if (!current) return;
    const value = answers[current.id] ?? null;
    const validationError = validate(current, value);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    if (isLast) {
      setIsSubmitting(true);
      try {
        const payload = ordered.map((q) => ({ question_id: q.id, value: answers[q.id] ?? null }));
        if (!preview) {
          await onSubmit(payload);
        }
        setDone(true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setIndex((i) => i + 1);
  }, [current, answers, isLast, ordered, onSubmit, preview]);

  const goPrev = React.useCallback(() => {
    if (index === 0) return;
    setError(null);
    setDirection(-1);
    setIndex((i) => i - 1);
  }, [index]);

  const setValue = React.useCallback(
    (value: FlowValue) => {
      if (!current) return;
      setAnswers((prev) => ({ ...prev, [current.id]: value }));
      setError(null);
    },
    [current]
  );

  // Auto-advance shortly after selecting a choice-like answer, mirroring
  // Typeform's snappy "pick and go" feel for single-select question types.
  const autoAdvanceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    if (!current || !CHOICE_LIKE.has(current.type)) return;
    const value = answers[current.id];
    if (isEmpty(value)) return;

    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      goNext();
    }, 350);
    return () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, current?.id]);

  // Global keyboard nav: Enter/ArrowDown advance, ArrowUp goes back. Text
  // inputs handle their own Enter via preventDefault+stopPropagation, so
  // this only fires for choice-style screens or when nothing is focused.
  // Also mirrors Typeform's letter/number shortcuts for choice-like
  // questions: Y/N for yes_no, A/B/C... for multiple_choice/dropdown, and
  // digits for rating -- visible as the badges rendered in QuestionRenderer.
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTextInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
        return;
      }
      if (e.key === "Enter" && !isTextInput) {
        e.preventDefault();
        goNext();
        return;
      }
      if (!current) return;

      if (current.type === "yes_no") {
        if (e.key.toLowerCase() === "y") setValue("Yes");
        else if (e.key.toLowerCase() === "n") setValue("No");
      } else if (current.type === "multiple_choice" || current.type === "dropdown") {
        const choices = current.settings.choices ?? [];
        const idx = choices.findIndex((_, i) => String.fromCharCode(65 + i).toLowerCase() === e.key.toLowerCase());
        if (idx !== -1) setValue(choices[idx]);
      } else if (current.type === "rating") {
        const n = Number(e.key);
        const max = current.settings.max ?? 5;
        if (Number.isInteger(n) && n >= 1 && n <= max) setValue(n);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, current, setValue]);

  if (!ordered.length) return null;

  if (done) {
    return <ThankYouScreen formTitle={formTitle} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <RespondentProgressBar current={index} total={ordered.length} />
      {preview && (
        <div className="fixed inset-x-0 top-1 z-30 flex justify-center">
          <span className="rounded-full bg-foreground px-3 py-1 text-[11px] font-medium text-background">
            Preview mode
          </span>
        </div>
      )}
      <AnimatePresence mode="wait" custom={direction}>
        <QuestionScreen
          key={current.id}
          question={current}
          index={index}
          total={ordered.length}
          direction={direction}
          value={answers[current.id] ?? null}
          error={error}
          isLast={isLast}
          isSubmitting={isSubmitting}
          onChange={setValue}
          onNext={goNext}
          onPrev={goPrev}
        />
      </AnimatePresence>

      {/* Floating up/down nav -- a clickable equivalent of the ArrowUp/
          ArrowDown keyboard shortcuts, matching Typeform's bottom-right
          navigation control. */}
      <div className="fixed bottom-6 right-6 z-20 flex overflow-hidden rounded-xl shadow-lg">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous question"
          className="flex size-10 items-center justify-center bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          <ChevronUp className="size-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="Next question"
          className="flex size-10 items-center justify-center border-l border-background/20 bg-foreground text-background transition-opacity hover:opacity-90"
        >
          <ChevronDown className="size-5" />
        </button>
      </div>
    </div>
  );
}
