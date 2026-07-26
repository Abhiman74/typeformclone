"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SCALE_OPTIONS = [3, 5, 7, 10];

export function RatingSettings({
  max,
  onChange,
}: {
  max: number;
  onChange: (max: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SCALE_OPTIONS.map((option) => (
        <Button
          key={option}
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onChange(option)}
          className={cn(option === max && "border-primary bg-primary/10 text-primary")}
        >
          1 – {option}
        </Button>
      ))}
    </div>
  );
}
