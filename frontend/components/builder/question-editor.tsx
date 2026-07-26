"use client";

import * as React from "react";
import { MessageSquarePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChoicesEditor } from "@/components/builder/choices-editor";
import { RatingSettings } from "@/components/builder/rating-settings";
import { QuestionTypePicker } from "@/components/builder/question-type-picker";
import { QuestionTypeIcon } from "@/components/shared/question-type-icon";
import { useDebouncedCallback } from "@/hooks/use-debounced-value";
import { QUESTION_TYPE_LABELS, type Question, type QuestionSettings, type QuestionType } from "@/types";

interface QuestionEditorProps {
  question: Question;
  onUpdate: (patch: {
    title?: string;
    description?: string | null;
    required?: boolean;
    type?: QuestionType;
    settings?: QuestionSettings;
  }) => void;
  onDelete: () => void;
}

const CHOICE_TYPES: QuestionType[] = ["multiple_choice", "dropdown"];
const TEXT_PLACEHOLDER_TYPES: QuestionType[] = ["short_text", "long_text", "email", "number"];

export function QuestionEditor({ question, onUpdate, onDelete }: QuestionEditorProps) {
  // The parent renders this component with `key={question.id}`, so React
  // fully remounts it (fresh state) whenever the selected question changes
  // -- no synchronization effect needed to reset these fields.
  const [title, setTitle] = React.useState(question.title);
  const [description, setDescription] = React.useState(question.description ?? "");
  const [showDescription, setShowDescription] = React.useState(Boolean(question.description));

  const debouncedTitleUpdate = useDebouncedCallback((value: string) => {
    onUpdate({ title: value });
  }, 500);

  const debouncedDescriptionUpdate = useDebouncedCallback((value: string) => {
    onUpdate({ description: value || null });
  }, 500);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    debouncedTitleUpdate(value);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    debouncedDescriptionUpdate(value);
  };

  const updateSettings = (patch: Partial<QuestionSettings>) => {
    onUpdate({ settings: { ...question.settings, ...patch } });
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-8 py-10">
      <div className="flex items-center justify-between">
        <QuestionTypePicker
          onSelect={(type) => onUpdate({ type })}
          trigger={
            <Button variant="outline" size="sm" className="gap-1.5">
              <QuestionTypeIcon type={question.type} className="size-3.5" />
              {QUESTION_TYPE_LABELS[question.type]}
            </Button>
          }
        />
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <Textarea
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Type your question here..."
          rows={2}
          className="resize-none border-none px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
        />

        {showDescription ? (
          <Input
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Add a description or help text (optional)"
            className="border-none px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowDescription(true)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <MessageSquarePlus className="size-3.5" />
            Add description
          </button>
        )}
      </div>

      {CHOICE_TYPES.includes(question.type) && (
        <div className="space-y-2">
          <Label>Options</Label>
          <ChoicesEditor
            choices={question.settings.choices ?? ["Option 1", "Option 2"]}
            onChange={(choices) => updateSettings({ choices })}
          />
        </div>
      )}

      {question.type === "rating" && (
        <div className="space-y-2">
          <Label>Scale</Label>
          <RatingSettings max={question.settings.max ?? 5} onChange={(max) => updateSettings({ max })} />
        </div>
      )}

      {TEXT_PLACEHOLDER_TYPES.includes(question.type) && (
        <div className="space-y-2">
          <Label htmlFor="placeholder">Placeholder text</Label>
          <Input
            id="placeholder"
            value={question.settings.placeholder ?? ""}
            onChange={(e) => updateSettings({ placeholder: e.target.value })}
            placeholder="Type your answer here..."
          />
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <div>
          <Label htmlFor="required-toggle">Required</Label>
          <p className="text-xs text-muted-foreground">Respondents must answer before continuing</p>
        </div>
        <Switch
          id="required-toggle"
          checked={question.required}
          onCheckedChange={(checked) => onUpdate({ required: checked })}
        />
      </div>
    </div>
  );
}
