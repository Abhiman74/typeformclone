import { apiClient } from "@/lib/api-client";
import type { Question, QuestionSettings, QuestionType } from "@/types";

export interface CreateQuestionInput {
  form_id: string;
  type: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  settings?: QuestionSettings;
  position?: number;
}

export interface UpdateQuestionInput {
  type?: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  settings?: QuestionSettings;
}

export const questionsApi = {
  create: async (input: CreateQuestionInput): Promise<Question> => {
    const { data } = await apiClient.post("/questions", input);
    return data;
  },

  update: async (id: string, patch: UpdateQuestionInput): Promise<Question> => {
    const { data } = await apiClient.put(`/questions/${id}`, patch);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/questions/${id}`);
  },

  reorder: async (formId: string, items: { id: string; position: number }[]): Promise<Question[]> => {
    const { data } = await apiClient.put("/questions/reorder", { form_id: formId, items });
    return data;
  },
};
