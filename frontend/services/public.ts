import { apiClient } from "@/lib/api-client";
import type { AnswerSubmit, PublicForm, ResponseDetail } from "@/types";

export const publicApi = {
  getForm: async (slug: string): Promise<PublicForm> => {
    const { data } = await apiClient.get(`/public/${slug}`);
    return data;
  },

  submit: async (slug: string, answers: AnswerSubmit[], isComplete: boolean): Promise<ResponseDetail> => {
    const { data } = await apiClient.post(`/public/${slug}/submit`, {
      answers,
      is_complete: isComplete,
    });
    return data;
  },
};
