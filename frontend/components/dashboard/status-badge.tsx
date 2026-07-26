import { Badge } from "@/components/ui/badge";
import type { FormStatus } from "@/types";

export function StatusBadge({ status }: { status: FormStatus }) {
  return (
    <Badge variant={status === "published" ? "success" : "secondary"}>
      <span className={`size-1.5 rounded-full ${status === "published" ? "bg-success" : "bg-muted-foreground"}`} />
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}
