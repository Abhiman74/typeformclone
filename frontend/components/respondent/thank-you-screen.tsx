"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function ThankYouScreen({ formTitle }: { formTitle: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
      >
        <CheckCircle2 className="size-16 text-success" strokeWidth={1.5} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="respondent-question-title mt-6"
      >
        Thank you!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="mt-3 max-w-md text-lg text-muted-foreground"
      >
        Your response to &ldquo;{formTitle}&rdquo; has been recorded.
      </motion.p>
    </div>
  );
}
