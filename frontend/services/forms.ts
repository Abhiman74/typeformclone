import { apiClient } from "@/lib/api-client";
import type { FormDetail, FormListItem, FormStatus } from "@/types";

export const formsApi = {
  list: async (): Promise<FormListItem[]> => {
    const { data } = await apiClient.get("/forms");
    return data;
  },

  get: async (id: string): Promise<FormDetail> => {
    const { data } = await apiClient.get(`/forms/${id}`);
    return data;
  },

  create: async (title: string): Promise<FormDetail> => {
    const { data } = await apiClient.post("/forms", { title });
    return data;
  },

  update: async (id: string, patch: { title?: string; status?: FormStatus }): Promise<FormDetail> => {
    const { data } = await apiClient.put(`/forms/${id}`, patch);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/forms/${id}`);
  },

  duplicate: async (id: string): Promise<FormDetail> => {
    const { data } = await apiClient.post(`/forms/${id}/duplicate`);
    return data;
  },

  publish: async (id: string): Promise<FormDetail> => {
    const { data } = await apiClient.post(`/forms/${id}/publish`);
    return data;
  },

  unpublish: async (id: string): Promise<FormDetail> => {
    const { data } = await apiClient.post(`/forms/${id}/unpublish`);
    return data;
  },
};
