"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FlowQuestion, FlowValue } from "@/components/respondent/types";

interface QuestionRendererProps {
  question: FlowQuestion;
  value: FlowValue;
  onChange: (value: FlowValue) => void;
  onAdvance: () => void;
  autoFocus?: boolean;
}

const inputBase =
  "w-full border-0 border-b-2 border-border bg-transparent pb-3 text-2xl sm:text-3xl font-medium outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary";

export function QuestionRenderer({ question, value, onChange, onAdvance, autoFocus }: QuestionRendererProps) {
  const placeholder = question.settings.placeholder || "Type your answer here...";

  switch (question.type) {
    case "short_text":
    case "email":
    case "number":
      return (
        <input
          autoFocus={autoFocus}
          type={question.type === "number" ? "number" : question.type === "email" ? "email" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdvance();
            }
          }}
          placeholder={placeholder}
          className={inputBase}
        />
      );

    case "long_text":
      return (
        <textarea
          autoFocus={autoFocus}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onAdvance();
            }
          }}
          placeholder={placeholder}
          rows={3}
          className={cn(inputBase, "resize-none")}
        />
      );

    case "multiple_choice":
    case "dropdown": {
      const choices = question.settings.choices ?? [];
      return (
        <div className="space-y-2.5">
          {choices.map((choice, index) => (
            <ChoiceRow
              key={choice}
              badge={String.fromCharCode(65 + index)}
              label={choice}
              selected={value === choice}
              onClick={() => onChange(choice)}
            />
          ))}
        </div>
      );
    }

    case "yes_no":
      // Rendered as stacked option rows with Y/N keyboard-shortcut badges --
      // matching Typeform's real yes/no layout -- rather than two large
      // side-by-side buttons, so the keyboard shortcut affordance is
      // visible and consistent with multiple_choice/dropdown.
      return (
        <div className="space-y-2.5">
          {[
            { label: "Yes", badge: "Y" },
            { label: "No", badge: "N" },
          ].map(({ label, badge }) => (
            <ChoiceRow
              key={label}
              badge={badge}
              label={label}
              selected={value === label}
              onClick={() => onChange(label)}
            />
          ))}
        </div>
      );

    case "rating": {
      const max = question.settings.max ?? 5;
      const useStars = max <= 5;
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
            const selected = typeof value === "number" && value >= n;
            const isExact = value === n;
            return (
              <motion.button
                key={n}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange(n)}
                className={cn(
                  "flex items-center justify-center rounded-xl border-2 font-medium transition-colors",
                  useStars ? "size-14" : "size-12 text-lg",
                  isExact
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {useStars ? (
                  <Star className={cn("size-6", selected && "fill-primary text-primary")} />
                ) : (
                  n
                )}
              </motion.button>
            );
          })}
        </div>
      );
    }

    default:
      return null;
  }
}

/** Shared row style for choice-like answers (multiple_choice, dropdown,
 * yes_no): a bordered keyboard-shortcut badge on the left plus the label,
 * matching the real product's option-row layout instead of ad hoc button
 * shapes per type. */
function ChoiceRow({
  badge,
  label,
  selected,
  onClick,
}: {
  badge: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-lg transition-colors",
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-accent/50"
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md border text-sm font-medium",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
        )}
      >
        {selected ? <Check className="size-4" /> : badge}
      </span>
      <span>{label}</span>
    </motion.button>
  );
}
