import {
  AlignLeft,
  CheckCircle2,
  ChevronDownSquare,
  Hash,
  List,
  Mail,
  Star,
  Type,
  type LucideIcon,
} from "lucide-react";

import type { QuestionType } from "@/types";

export const QUESTION_TYPE_ICONS: Record<QuestionType, LucideIcon> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: List,
  dropdown: ChevronDownSquare,
  email: Mail,
  number: Hash,
  yes_no: CheckCircle2,
  rating: Star,
};

export function QuestionTypeIcon({ type, className }: { type: QuestionType; className?: string }) {
  const Icon = QUESTION_TYPE_ICONS[type];
  return <Icon className={className} />;
}
