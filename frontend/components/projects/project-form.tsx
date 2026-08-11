"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PRIORITIES, PRIORITY_LABELS } from "@/types/task";
import type { Project, CreateProjectInput } from "@/types/project";
import { ApiError } from "@/lib/api";

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
  onDelete?: () => void;
  initialProject?: Project;
}

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  initialProject,
}: ProjectFormProps) {
  const isEditMode = !!initialProject;

  const [name, setName] = useState(() => initialProject?.name ?? "");
  const [priority, setPriority] = useState<CreateProjectInput["priority"]>(
    () => initialProject?.priority ?? "NO_PRIORITY",
  );
  const [dueDate, setDueDate] = useState(() =>
    initialProject?.dueDate ? initialProject.dueDate.slice(0, 10) : "",
  );
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    if (isSubmitting) return; // guard against duplicate submits

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        name: name.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Couldn't save the project. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? "Edit Project" : "Add Project"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error}
          placeholder="e.g. Design Homepage"
          maxLength={200}
          required
          autoFocus
        />

        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as CreateProjectInput["priority"])}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {submitError ? (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        <div className="mt-1 flex items-center justify-between gap-2">
          {isEditMode && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-destructive hover:underline"
            >
              Delete project
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditMode ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
