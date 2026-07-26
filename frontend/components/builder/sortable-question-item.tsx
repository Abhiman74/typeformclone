"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { QuestionTypeIcon } from "@/components/shared/question-type-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SortableQuestionItem({
  question,
  index,
  active,
  onSelect,
  onDelete,
}: SortableQuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 rounded-xl border px-2 py-2 transition-colors",
        active ? "border-primary/40 bg-accent" : "border-transparent hover:bg-accent/60",
        isDragging && "z-10 shadow-md opacity-90"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </button>

      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
          {index + 1}
        </span>
        <QuestionTypeIcon type={question.type} className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate text-sm">{question.title || "Untitled question"}</span>
        {question.required && <span className="text-destructive">*</span>}
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
