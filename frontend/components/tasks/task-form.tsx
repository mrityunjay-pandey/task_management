"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TASK_STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from "@/types/task";
import type { TaskStatus, CreateTaskInput } from "@/types/task";
import { ApiError } from "@/lib/api";

// Create-only: editing an existing task happens on its detail page
// (/tasks/[id]) instead, matching the Figma interaction of a full page
// swap rather than a modal. Keeping this component create-only avoids an
// edit-mode code path that's no longer reachable from anywhere in the app.
interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  defaultStatus?: TaskStatus;
}

interface FormErrors {
  title?: string;
}

export function TaskForm({ isOpen, onClose, onSubmit, defaultStatus }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus ?? "TODO");
  const [priority, setPriority] = useState<CreateTaskInput["priority"]>("NO_PRIORITY");
  const [dueDate, setDueDate] = useState("");
  // Comma-separated input, matching the Figma design's tag chips (e.g.
  // "Deployment, Testing") - parsed into an array on submit. A single text
  // field is simpler to build/explain than a full tag-picker UI while still
  // producing the same labelNames the backend expects.
  const [labelsInput, setLabelsInput] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!title.trim()) {
      nextErrors.title = "Title is required";
    } else if (title.length > 200) {
      nextErrors.title = "Title must be 200 characters or fewer";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || isSubmitting) return; // guards against duplicate submits too

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        labelNames: parseLabels(labelsInput),
      });
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Couldn't save the task. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="e.g. Write API documentation"
          maxLength={200}
          required
          autoFocus
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more detail (optional)"
          maxLength={2000}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as CreateTaskInput["priority"])}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Input
          label="Labels"
          value={labelsInput}
          onChange={(e) => setLabelsInput(e.target.value)}
          placeholder="e.g. Deployment, Testing (comma-separated)"
        />

        {submitError ? (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// "Deployment, Testing, " -> ["Deployment", "Testing"] - trims whitespace,
// drops empty entries (e.g. from a trailing comma), and de-duplicates.
function parseLabels(input: string): string[] | undefined {
  const names = input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const unique = Array.from(new Set(names));
  return unique.length > 0 ? unique : undefined;
}
