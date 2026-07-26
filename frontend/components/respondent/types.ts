import type { QuestionSettings, QuestionType } from "@/types";

/** Structural subset both `Question` (builder) and `PublicQuestion`
 * (respondent API) satisfy -- lets the respondent flow be shared between
 * the builder's live preview and the real public form page. */
export interface FlowQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  settings: QuestionSettings;
  position: number;
}

export type FlowValue = string | number | boolean | null;
