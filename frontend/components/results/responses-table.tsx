"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/format";
import type { ResponseListItem } from "@/types";

export function ResponsesTable({ responses }: { responses: ResponseListItem[] }) {
  const router = useRouter();

  if (responses.length === 0) {
    return <EmptyState icon={Inbox} title="No responses yet" description="Responses will appear here once your form is published and shared." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Answers</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {responses.map((response) => (
            <tr
              key={response.id}
              onClick={() => router.push(`/responses/${response.id}`)}
              className="cursor-pointer border-t border-border transition-colors hover:bg-accent/50"
            >
              <td className="px-4 py-3">{formatDateTime(response.submitted_at)}</td>
              <td className="px-4 py-3">
                <Badge variant={response.is_complete ? "success" : "secondary"}>
                  {response.is_complete ? "Complete" : "Partial"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{response.answer_count} answered</td>
              <td className="px-4 py-3 text-right">
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
