// Centralized query-key factory so cache invalidation stays consistent
// across every hook that reads/writes the same resource.
export const queryKeys = {
  forms: {
    all: ["forms"] as const,
    detail: (id: string) => ["forms", id] as const,
  },
  publicForm: (slug: string) => ["public-form", slug] as const,
  responses: {
    list: (formId: string) => ["responses", formId] as const,
    detail: (id: string) => ["response", id] as const,
  },
  stats: (formId: string) => ["stats", formId] as const,
};
