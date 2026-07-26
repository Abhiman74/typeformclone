import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query-keys";
import { formsApi } from "@/services/forms";
import type { FormStatus } from "@/types";

export function useForms() {
  return useQuery({
    queryKey: queryKeys.forms.all,
    queryFn: formsApi.list,
  });
}

export function useForm(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.forms.detail(id ?? ""),
    queryFn: () => formsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => formsApi.create(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to create form"),
  });
}

export function useUpdateForm(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { title?: string; status?: FormStatus }) => formsApi.update(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.forms.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update form"),
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      toast.success("Form deleted");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to delete form"),
  });
}

export function useDuplicateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      toast.success("Form duplicated");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to duplicate form"),
  });
}

export function useTogglePublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? formsApi.publish(id) : formsApi.unpublish(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.forms.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.forms.all });
      toast.success(updated.status === "published" ? "Form published" : "Form unpublished");
    },
    onError: (error: Error) => toast.error(error.message || "Failed to update publish state"),
  });
}
