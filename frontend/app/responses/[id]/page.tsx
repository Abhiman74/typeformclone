"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuestionTypeIcon } from "@/components/shared/question-type-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import { useResponse } from "@/hooks/use-responses";
import { useForm } from "@/hooks/use-forms";

export default function ResponseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: response, isLoading, isError } = useResponse(params.id);
  const { data: form } = useForm(response?.form_id);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !response) {
    return (
      <div className="flex flex-1 items-center justify-center px-6">
        <EmptyState icon={Loader2} title="Response not found" />
      </div>
    );
  }

  const questionById = new Map((form?.questions ?? []).map((q) => [q.id, q]));

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 sm:px-10">
      <header className="mb-8 flex items-center gap-3">
        <Link href={form ? `/analytics/${form.id}` : "/dashboard"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{form?.title ?? "Response"}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {formatDateTime(response.submitted_at)}
            <Badge variant={response.is_complete ? "success" : "secondary"}>
              {response.is_complete ? "Complete" : "Partial"}
            </Badge>
          </div>
        </div>
      </header>

      <div className="space-y-4">
        {response.answers.map((answer) => {
          const question = questionById.get(answer.question_id);
          return (
            <Card key={answer.id} className="gap-2 p-5">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {question && <QuestionTypeIcon type={question.type} className="size-3.5" />}
                {question?.title ?? "Deleted question"}
              </div>
              <p className="text-base">
                {answer.value === null || answer.value === "" ? (
                  <span className="text-muted-foreground italic">No answer</span>
                ) : (
                  String(answer.value)
                )}
              </p>
            </Card>
          );
        })}

        {response.answers.length === 0 && (
          <EmptyState icon={Loader2} title="No answers recorded for this response" />
        )}
      </div>
    </div>
  );
}
