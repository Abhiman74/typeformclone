"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

import { IntroScreen } from "@/components/respondent/intro-screen";
import { RespondentFlow } from "@/components/respondent/respondent-flow";
import { EmptyState } from "@/components/shared/empty-state";
import { usePublicForm } from "@/hooks/use-public-form";
import { publicApi } from "@/services/public";
import type { FlowValue } from "@/components/respondent/types";

export default function PublicFormPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { data: form, isLoading, isError, error } = usePublicForm(slug);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    if (started) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") setStarted(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [started]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !form) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <EmptyState
          icon={AlertTriangle}
          title={status === 403 ? "This form isn't accepting responses" : "Form not found"}
          description={
            status === 403
              ? "The owner has unpublished this form or it hasn't been published yet."
              : "Double check the link -- this form may have been deleted."
          }
        />
      </div>
    );
  }

  const handleSubmit = async (answers: { question_id: string; value: FlowValue }[]) => {
    await publicApi.submit(slug, answers, true);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-background">
      {!started ? (
        <IntroScreen title={form.title} questionCount={form.questions.length} onStart={() => setStarted(true)} />
      ) : (
        <RespondentFlow formTitle={form.title} questions={form.questions} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
