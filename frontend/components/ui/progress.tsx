"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentProps<"div"> {
  value: number; // 0 - 100
}

/**
 * Custom animated progress bar (rather than Radix's Progress primitive)
 * because the respondent flow needs a spring-based fill animation on every
 * question change, which is simplest to drive directly with Framer Motion.
 */
function Progress({ value, className, ...props }: ProgressProps) {
  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={false}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </div>
  );
}

export { Progress };
