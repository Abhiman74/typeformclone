import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { publicApi } from "@/services/public";

export function usePublicForm(slug: string) {
  return useQuery({
    queryKey: queryKeys.publicForm(slug),
    queryFn: () => publicApi.getForm(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}
