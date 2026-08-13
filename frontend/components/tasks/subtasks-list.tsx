"use client";

import { useState } from "react";
import type { Task } from "@/types/task";
import { PriorityBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SubtasksListProps {
  subtasks: Task[];
  onAdd: (title: string) => Promise<void>;
}

export function SubtasksList({ subtasks, onAdd }: SubtasksListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return; // guard against empty/duplicate submits

    setIsSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle("");
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Subtasks {subtasks.length > 0 ? `(${subtasks.length})` : ""}
      </h3>

      {subtasks.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-background text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Task</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Priority</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {subtasks.map((subtask) => (
                <tr key={subtask.id} className="border-t border-border">
                  <td className="max-w-[200px] truncate px-3 py-2 text-card-foreground">
                    {subtask.title}
                  </td>
                  <td className="hidden px-3 py-2 sm:table-cell">
                    <PriorityBadge priority={subtask.priority} />
                  </td>
                  <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                    {subtask.dueDate
                      ? new Date(subtask.dueDate).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {isAdding ? (
        <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
          <div className="flex-1">
            <Input
              label="Subtask title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Subtask title"
              autoFocus
            />
          </div>
          <Button type="submit" size="sm" isLoading={isSubmitting}>
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setTitle("");
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="mt-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          + Add Subtasks
        </button>
      )}
    </div>
  );
}
