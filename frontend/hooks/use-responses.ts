import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { responsesApi } from "@/services/responses";

export function useResponses(formId: string) {
  return useQuery({
    queryKey: queryKeys.responses.list(formId),
    queryFn: () => responsesApi.list(formId),
    enabled: Boolean(formId),
  });
}

export function useResponse(responseId: string) {
  return useQuery({
    queryKey: queryKeys.responses.detail(responseId),
    queryFn: () => responsesApi.get(responseId),
    enabled: Boolean(responseId),
  });
}

export function useFormStats(formId: string) {
  return useQuery({
    queryKey: queryKeys.stats(formId),
    queryFn: () => responsesApi.stats(formId),
    enabled: Boolean(formId),
  });
}
