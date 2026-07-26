"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import type { AutosaveStatus } from "@/hooks/use-autosave-status";
import { cn } from "@/lib/utils";

export function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
  return (
    <div className="flex h-5 w-24 items-center">
      <AnimatePresence mode="wait">
        {status !== "idle" && (
          <motion.div
            key={status}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "flex items-center gap-1.5 text-xs",
              status === "saved" ? "text-success" : "text-muted-foreground"
            )}
          >
            {status === "saving" ? (
              <>
                <Loader2 className="size-3 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="size-3" /> Saved
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
