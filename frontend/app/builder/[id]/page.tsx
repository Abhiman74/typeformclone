"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";

import { BuilderHeader } from "@/components/builder/builder-header";
import { QuestionSidebar } from "@/components/builder/question-sidebar";
import { QuestionEditor } from "@/components/builder/question-editor";
import { LivePreview } from "@/components/builder/live-preview";
import { PreviewModal } from "@/components/builder/preview-modal";
import { QuestionTypePicker } from "@/components/builder/question-type-picker";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { useForm, useUpdateForm, useTogglePublish } from "@/hooks/use-forms";
import {
  useCreateQuestion,
  useDeleteQuestion,
  useReorderQuestions,
  useUpdateQuestion,
} from "@/hooks/use-questions";
import { useAutosaveStatus } from "@/hooks/use-autosave-status";
import type { QuestionType } from "@/types";

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;
  const router = useRouter();

  const { data: form, isLoading, isError } = useForm(formId);
  const updateForm = useUpdateForm(formId);
  const togglePublish = useTogglePublish();
  const createQuestion = useCreateQuestion(formId);
  const updateQuestion = useUpdateQuestion(formId);
  const deleteQuestion = useDeleteQuestion(formId);
  const reorderQuestions = useReorderQuestions(formId);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const isPending =
    updateForm.isPending ||
    createQuestion.isPending ||
    updateQuestion.isPending ||
    deleteQuestion.isPending ||
    reorderQuestions.isPending;
  const autosaveStatus = useAutosaveStatus(isPending);

  const questions = React.useMemo(
    () => (form ? [...form.questions].sort((a, b) => a.position - b.position) : []),
    [form]
  );

  // Derive the effective selection from render state instead of an effect:
  // if nothing is selected yet, or the selected question was just deleted,
  // fall back to the first question. `setSelectedId` is only ever called
  // from real user events (select/add/delete), never to mirror this.
  const effectiveSelectedId =
    selectedId && questions.some((q) => q.id === selectedId) ? selectedId : (questions[0]?.id ?? null);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <EmptyState
          icon={Loader2}
          title="Form not found"
          description="This form may have been deleted."
          action={<Button onClick={() => router.push("/dashboard")}>Back to dashboard</Button>}
        />
      </div>
    );
  }

  const selectedQuestion = questions.find((q) => q.id === effectiveSelectedId) ?? null;

  const handleAdd = (type: QuestionType) => {
    createQuestion.mutate(
      { type, title: "", required: false, settings: type === "multiple_choice" || type === "dropdown" ? { choices: ["Option 1", "Option 2"] } : {} },
      { onSuccess: (question) => setSelectedId(question.id) }
    );
  };

  return (
    <div className="flex h-screen flex-col">
      <BuilderHeader
        form={form}
        autosaveStatus={autosaveStatus}
        onTitleChange={(title) => updateForm.mutate({ title })}
        onTogglePublish={() => togglePublish.mutate({ id: form.id, publish: form.status !== "published" })}
        onOpenPreview={() => setPreviewOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar
          questions={questions}
          selectedId={effectiveSelectedId}
          onSelect={setSelectedId}
          onAdd={handleAdd}
          onDelete={(id) => deleteQuestion.mutate(id)}
          onReorder={(items) => reorderQuestions.mutate(items)}
        />

        <main className="flex-1 overflow-y-auto">
          {selectedQuestion ? (
            <QuestionEditor
              key={selectedQuestion.id}
              question={selectedQuestion}
              onUpdate={(patch) => updateQuestion.mutate({ id: selectedQuestion.id, patch })}
              onDelete={() => deleteQuestion.mutate(selectedQuestion.id)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={Plus}
                title="No questions yet"
                description="Add your first question to start building this form."
                action={
                  <QuestionTypePicker
                    onSelect={handleAdd}
                    trigger={
                      <Button>
                        <Plus className="size-4" />
                        Add question
                      </Button>
                    }
                  />
                }
              />
            </div>
          )}
        </main>

        <LivePreview question={selectedQuestion} onOpenFullPreview={() => setPreviewOpen(true)} />
      </div>

      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={form.title}
        questions={questions}
      />
    </div>
  );
}
