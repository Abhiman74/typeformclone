import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <Card className="gap-1 p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
    </Card>
  );
}
