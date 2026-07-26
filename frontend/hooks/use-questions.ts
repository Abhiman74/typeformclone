import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import { questionsApi, type CreateQuestionInput, type UpdateQuestionInput } from "@/services/questions";
import type { FormDetail, Question } from "@/types";

/**
 * All mutations here optimistically patch the cached FormDetail so the
 * builder's sidebar/editor/preview panes update instantly, then reconcile
 * with the server response. This is what makes the builder feel
 * "everything updates instantly" per spec, without waiting on network
 * round-trips for every keystroke-driven change.
 */
export function useCreateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateQuestionInput, "form_id">) =>
      questionsApi.create({ ...input, form_id: formId }),
    onSuccess: (question) => {
      queryClient.setQueryData<FormDetail | undefined>(queryKeys.forms.detail(formId), (old) =>
        old ? { ...old, questions: [...old.questions, question] } : old
      );
    },
    onError: (error: Error) => toast.error(error.message || "Failed to add question"),
  });
}

export function useUpdateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateQuestionInput }) =>
      questionsApi.update(id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.detail(formId) });
      const previous = queryClient.getQueryData<FormDetail>(queryKeys.forms.detail(formId));
      queryClient.setQueryData<FormDetail | undefined>(queryKeys.forms.detail(formId), (old) =>
        old
          ? {
              ...old,
              questions: old.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)),
            }
          : old
      );
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.forms.detail(formId), context.previous);
      }
      toast.error(error.message || "Failed to update question");
    },
    onSuccess: (question) => {
      queryClient.setQueryData<FormDetail | undefined>(queryKeys.forms.detail(formId), (old) =>
        old ? { ...old, questions: old.questions.map((q) => (q.id === question.id ? question : q)) } : old
      );
    },
  });
}

export function useDeleteQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionsApi.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.detail(formId) });
      const previous = queryClient.getQueryData<FormDetail>(queryKeys.forms.detail(formId));
      queryClient.setQueryData<FormDetail | undefined>(queryKeys.forms.detail(formId), (old) =>
        old ? { ...old, questions: old.questions.filter((q) => q.id !== id) } : old
      );
      return { previous };
    },
    onError: (error: Error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.forms.detail(formId), context.previous);
      }
      toast.error(error.message || "Failed to delete question");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    },
  });
}

export function useReorderQuestions(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; position: number }[]) => questionsApi.reorder(formId, items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.forms.detail(formId) });
      const previous = queryClient.getQueryData<FormDetail>(queryKeys.forms.detail(formId));
      const positionById = new Map(items.map((i) => [i.id, i.position]));
      queryClient.setQueryData<FormDetail | undefined>(queryKeys.forms.detail(formId), (old) =>
        old
          ? {
              ...old,
              questions: [...old.questions]
                .map((q) => ({ ...q, position: positionById.get(q.id) ?? q.position }))
                .sort((a, b) => a.position - b.position),
            }
          : old
      );
      return { previous };
    },
    onError: (error: Error, _items, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.forms.detail(formId), context.previous);
      }
      toast.error(error.message || "Failed to reorder questions");
    },
    onSuccess: (questions: Question[]) => {
      queryClient.setQueryData<FormDetail | undefined>(queryKeys.forms.detail(formId), (old) =>
        old ? { ...old, questions } : old
      );
    },
  });
}
