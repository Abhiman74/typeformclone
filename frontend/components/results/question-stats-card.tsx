import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreakdownBar } from "@/components/results/breakdown-bar";
import { QuestionTypeIcon } from "@/components/shared/question-type-icon";
import { QUESTION_TYPE_LABELS, type QuestionStats, type QuestionType } from "@/types";

export function QuestionStatsCard({ stat }: { stat: QuestionStats }) {
  const type = stat.question_type as QuestionType;

  return (
    <Card className="py-5">
      <CardHeader className="px-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <QuestionTypeIcon type={type} className="size-3.5" />
          {QUESTION_TYPE_LABELS[type] ?? type}
          <span>· {stat.total_answers} answers</span>
        </div>
        <CardTitle className="text-base font-semibold">{stat.question_title || "Untitled question"}</CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        {stat.breakdown && stat.breakdown.length > 0 && (
          <div className="space-y-3">
            {stat.breakdown.map((b) => (
              <BreakdownBar key={b.label} label={b.label} count={b.count} percentage={b.percentage} />
            ))}
          </div>
        )}

        {stat.average !== null && stat.average !== undefined && !stat.breakdown && (
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-semibold">{stat.average}</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{stat.min_value}</p>
              <p className="text-xs text-muted-foreground">Min</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">{stat.max_value}</p>
              <p className="text-xs text-muted-foreground">Max</p>
            </div>
          </div>
        )}

        {stat.average !== null && stat.average !== undefined && stat.breakdown && (
          <p className="mt-3 text-sm text-muted-foreground">Average rating: {stat.average}</p>
        )}

        {stat.sample_answers && stat.sample_answers.length > 0 && (
          <ul className="space-y-2">
            {stat.sample_answers.map((answer, i) => (
              <li key={i} className="rounded-lg bg-muted px-3 py-2 text-sm">
                &ldquo;{answer}&rdquo;
              </li>
            ))}
          </ul>
        )}

        {stat.total_answers === 0 && (
          <p className="text-sm text-muted-foreground">No answers yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
