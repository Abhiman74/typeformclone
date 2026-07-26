"use client";

import * as React from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { QuestionTypePicker } from "@/components/builder/question-type-picker";
import { SortableQuestionItem } from "@/components/builder/sortable-question-item";
import type { Question, QuestionType } from "@/types";

interface QuestionSidebarProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: QuestionType) => void;
  onDelete: (id: string) => void;
  onReorder: (items: { id: string; position: number }[]) => void;
}

export function QuestionSidebar({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onReorder,
}: QuestionSidebarProps) {
  const [pendingDelete, setPendingDelete] = React.useState<Question | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ordered = [...questions].sort((a, b) => a.position - b.position);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((q) => q.id === active.id);
    const newIndex = ordered.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = [...ordered];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);

    onReorder(next.map((q, index) => ({ id: q.id, position: index })));
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-muted/30">
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Questions ({questions.length})
        </h2>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ordered.map((q) => q.id)} strategy={verticalListSortingStrategy}>
            {ordered.map((question, index) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                index={index}
                active={question.id === selectedId}
                onSelect={() => onSelect(question.id)}
                onDelete={() => setPendingDelete(question)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="border-t border-border p-3">
        <QuestionTypePicker
          onSelect={onAdd}
          trigger={
            <Button variant="outline" className="w-full justify-center">
              <Plus className="size-4" />
              Add question
            </Button>
          }
        />
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this question?"
        description="This will permanently remove the question. Existing responses to it are kept for historical stats."
        confirmLabel="Delete question"
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </aside>
  );
}
