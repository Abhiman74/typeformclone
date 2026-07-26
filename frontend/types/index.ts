// Mirrors the backend's Pydantic schemas 1:1 -- keep in sync with
// backend/app/schemas/*.py whenever the API contract changes.

export type FormStatus = "draft" | "published";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionSettings {
  choices?: string[]; // multiple_choice, dropdown
  max?: number; // rating (scale max), defaults to 5
  min?: number; // number
  placeholder?: string;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  settings: QuestionSettings;
}

export interface FormListItem {
  id: string;
  title: string;
  status: FormStatus;
  slug: string;
  created_at: string;
  updated_at: string;
  response_count: number;
}

export interface FormDetail {
  id: string;
  title: string;
  status: FormStatus;
  slug: string;
  created_at: string;
  updated_at: string;
  questions: Question[];
}

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  settings: QuestionSettings;
  position: number;
}

export interface PublicForm {
  id: string;
  title: string;
  slug: string;
  questions: PublicQuestion[];
}

export interface AnswerSubmit {
  question_id: string;
  value: unknown;
}

export interface AnswerOut {
  id: string;
  question_id: string;
  value: unknown;
}

export interface ResponseListItem {
  id: string;
  form_id: string;
  submitted_at: string;
  is_complete: boolean;
  answer_count: number;
}

export interface ResponseDetail {
  id: string;
  form_id: string;
  submitted_at: string;
  is_complete: boolean;
  answers: AnswerOut[];
}

export interface ChoiceBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionStats {
  question_id: string;
  question_title: string;
  question_type: string;
  total_answers: number;
  breakdown: ChoiceBreakdown[] | null;
  average: number | null;
  min_value: number | null;
  max_value: number | null;
  sample_answers: string[] | null;
}

export interface FormStats {
  form_id: string;
  total_responses: number;
  completed_responses: number;
  partial_responses: number;
  completion_rate: number;
  questions: QuestionStats[];
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: "Short Text",
  long_text: "Long Text",
  multiple_choice: "Multiple Choice",
  dropdown: "Dropdown",
  email: "Email",
  number: "Number",
  yes_no: "Yes / No",
  rating: "Rating",
};
