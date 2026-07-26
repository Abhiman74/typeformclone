import type { Question, ResponseDetail } from "@/types";

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Builds a CSV with one row per response and one column per question
 * (in form order), plus submitted-at/status metadata columns. */
export function buildResponsesCsv(questions: Question[], responses: ResponseDetail[]): string {
  const orderedQuestions = [...questions].sort((a, b) => a.position - b.position);
  const header = ["Submitted At", "Status", ...orderedQuestions.map((q) => q.title || "Untitled question")];

  const rows = responses.map((response) => {
    const valueByQuestion = new Map(response.answers.map((a) => [a.question_id, a.value]));
    return [
      response.submitted_at,
      response.is_complete ? "Complete" : "Partial",
      ...orderedQuestions.map((q) => valueByQuestion.get(q.id) ?? ""),
    ];
  });

  return [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
