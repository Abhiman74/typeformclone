"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function IntroScreen({ title, questionCount, onStart }: { title: string; questionCount: number; onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl"
      >
        <h1 className="respondent-question-title">{title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {questionCount} question{questionCount === 1 ? "" : "s"} · takes about {Math.max(1, Math.round(questionCount * 0.3))} minute
          {Math.max(1, Math.round(questionCount * 0.3)) === 1 ? "" : "s"}
        </p>
        <Button size="lg" onClick={onStart} className="mt-8 gap-2">
          Start <ArrowRight className="size-4" />
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">Enter ↵</kbd>
        </p>
      </motion.div>
    </div>
  );
}
