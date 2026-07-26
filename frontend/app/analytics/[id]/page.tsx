"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Loader2, MessagesSquare, Percent } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/results/stat-card";
import { QuestionStatsCard } from "@/components/results/question-stats-card";
import { ResponsesTable } from "@/components/results/responses-table";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useForm } from "@/hooks/use-forms";
import { useFormStats, useResponses } from "@/hooks/use-responses";
import { responsesApi } from "@/services/responses";
import { buildResponsesCsv, downloadCsv } from "@/lib/csv-export";

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const formId = params.id;

  const { data: form } = useForm(formId);
  const { data: stats, isLoading: statsLoading } = useFormStats(formId);
  const { data: responses, isLoading: responsesLoading } = useResponses(formId);
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async () => {
    if (!form || !responses?.length) {
      toast.error("No responses to export yet");
      return;
    }
    setExporting(true);
    try {
      const details = await Promise.all(responses.map((r) => responsesApi.get(r.id)));
      const csv = buildResponsesCsv(form.questions, details);
      downloadCsv(`${form.title.replace(/\s+/g, "-").toLowerCase()}-responses.csv`, csv);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExporting(false);
    }
  };

  if (!form || statsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10 sm:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{form.title}</h1>
              <StatusBadge status={form.status} />
            </div>
            <p className="text-sm text-muted-foreground">Results & analytics</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-1.5">
          {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          Export CSV
        </Button>
      </header>

      {stats && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={MessagesSquare} label="Total responses" value={stats.total_responses} />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed_responses}
            sublabel={`${stats.partial_responses} partial`}
          />
          <StatCard icon={Percent} label="Completion rate" value={`${stats.completion_rate}%`} />
        </div>
      )}

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="responses">
            Responses {responses ? `(${responses.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6 space-y-4">
          {stats?.questions.map((stat) => (
            <QuestionStatsCard key={stat.question_id} stat={stat} />
          ))}
        </TabsContent>

        <TabsContent value="responses" className="mt-6">
          {responsesLoading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : (
            <ResponsesTable responses={responses ?? []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
