import { Progress } from "@/components/ui/progress";

export function RespondentProgressBar({ current, total }: { current: number; total: number }) {
  const percentage = total > 0 ? ((current + 1) / total) * 100 : 0;
  return (
    <div className="fixed inset-x-0 top-0 z-20">
      <Progress value={percentage} className="h-1 rounded-none" />
      <div className="absolute right-4 top-3 text-xs font-medium text-muted-foreground">
        {current + 1} / {total}
      </div>
    </div>
  );
}
