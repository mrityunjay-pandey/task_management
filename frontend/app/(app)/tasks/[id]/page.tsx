"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTaskDetail } from "@/hooks/use-task-detail";
import { SubtasksList } from "@/components/tasks/subtasks-list";
import { CommentsThread } from "@/components/tasks/comments-thread";
import { TaskDetailsPanel } from "@/components/tasks/task-details-panel";
import { ConfirmDialog } from "@/components/ui/dialog";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import type { TaskStatus, Priority } from "@/types/task";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = params.id;

  const { task, isLoading, error, refetch, updateTask, addSubtask, addComment, removeTask } =
    useTaskDetail(taskId);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Local draft state for the title/description inputs - saved onBlur
  // rather than on every keystroke, so we're not firing a PATCH request
  // per character typed.
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await removeTask();
      router.push("/tasks");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingState rows={3} />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <ErrorState message={error ?? "Task not found."} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-border bg-card px-4 py-3 md:px-6">
        <Link href="/tasks" className="text-sm text-muted-foreground hover:underline">
          ← Back to Tasks
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <input
              value={titleDraft ?? task.title}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                const trimmed = (titleDraft ?? "").trim();
                if (titleDraft !== null && trimmed && trimmed !== task.title) {
                  updateTask({ title: trimmed });
                }
                setTitleDraft(null);
              }}
              aria-label="Task title"
              className="w-full border-none bg-transparent text-xl font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 -mx-1"
            />
            <textarea
              value={descriptionDraft ?? task.description ?? ""}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              onBlur={() => {
                if (descriptionDraft !== null && descriptionDraft !== (task.description ?? "")) {
                  updateTask({ description: descriptionDraft });
                }
                setDescriptionDraft(null);
              }}
              placeholder="Add a description..."
              aria-label="Task description"
              rows={2}
              className="mt-1 w-full resize-none border-none bg-transparent text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 -mx-1"
            />
          </div>

          <SubtasksList
            subtasks={task.subtasks ?? []}
            onAdd={(title) => addSubtask({ title })}
          />

          <CommentsThread comments={task.comments ?? []} onAddComment={addComment} />

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="text-sm text-destructive hover:underline"
          >
            Delete task
          </button>
        </div>

        <TaskDetailsPanel
          task={task}
          activities={task.activities ?? []}
          onStatusChange={(status: TaskStatus) => updateTask({ status })}
          onPriorityChange={(priority: Priority) => updateTask({ priority })}
          onDueDateChange={(dueDate: string) =>
            updateTask({ dueDate: dueDate ? new Date(dueDate).toISOString() : undefined })
          }
        />
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete this task?"
        description={`"${task.title}" will be permanently deleted. This can't be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
