"use client";

import * as React from "react";
import { GripVertical, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChoicesEditorProps {
  choices: string[];
  onChange: (choices: string[]) => void;
}

/** Simple add/edit/remove list editor for multiple_choice & dropdown
 * question options. Reordering choices isn't a spec requirement (only
 * question reordering is), so this stays list-based rather than
 * drag-and-drop to keep the interaction surface focused. */
export function ChoicesEditor({ choices, onChange }: ChoicesEditorProps) {
  const updateAt = (index: number, value: string) => {
    const next = [...choices];
    next[index] = value;
    onChange(next);
  };

  const removeAt = (index: number) => {
    onChange(choices.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...choices, `Option ${choices.length + 1}`]);
  };

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => (
        <div key={index} className="flex items-center gap-2">
          <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
          <Input
            value={choice}
            onChange={(e) => updateAt(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeAt(index)}
            disabled={choices.length <= 1}
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-1">
        <Plus className="size-3.5" />
        Add option
      </Button>
    </div>
  );
}
