"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUESTION_TYPE_ICONS } from "@/components/shared/question-type-icon";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/types";

const ORDER: QuestionType[] = [
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "email",
  "number",
  "yes_no",
  "rating",
];

export function QuestionTypePicker({
  onSelect,
  trigger,
}: {
  onSelect: (type: QuestionType) => void;
  trigger: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {ORDER.map((type) => {
          const Icon = QUESTION_TYPE_ICONS[type];
          return (
            <DropdownMenuItem key={type} onSelect={() => onSelect(type)}>
              <Icon className="size-4" />
              {QUESTION_TYPE_LABELS[type]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
