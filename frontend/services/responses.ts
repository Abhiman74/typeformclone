import { apiClient } from "@/lib/api-client";
import type { FormStats, ResponseDetail, ResponseListItem } from "@/types";

export const responsesApi = {
  list: async (formId: string): Promise<ResponseListItem[]> => {
    const { data } = await apiClient.get(`/forms/${formId}/responses`);
    return data;
  },

  get: async (responseId: string): Promise<ResponseDetail> => {
    const { data } = await apiClient.get(`/responses/${responseId}`);
    return data;
  },

  stats: async (formId: string): Promise<FormStats> => {
    const { data } = await apiClient.get(`/forms/${formId}/stats`);
    return data;
  },
};
