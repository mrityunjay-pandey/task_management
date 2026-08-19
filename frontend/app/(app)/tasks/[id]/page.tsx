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

  const {
    task,
    isLoading,
    error,
    refetch,
    updateTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    removeTask,
  } = useTaskDetail(taskId);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetailsPanelVisible, setIsDetailsPanelVisible] = useState(true);

  // Local draft state for title/description inputs
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
      {/* Header bar matching Figma */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 md:px-6">
        <Link
          href="/tasks"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeftIcon />
          <span>Back to Tasks</span>
        </Link>

        {/* Top-right icon row */}
        <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
          <button
            type="button"
            title="Lock task (decorative)"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted/20 hover:text-foreground"
          >
            <LockIcon />
          </button>
          <button
            type="button"
            title="Watchers (decorative)"
            className="flex h-8 items-center gap-1 rounded-md px-2 hover:bg-muted/20 hover:text-foreground text-xs"
          >
            <EyeIcon />
            <span className="text-[11px] font-medium">1</span>
          </button>
          <button
            type="button"
            title="Share task (decorative)"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted/20 hover:text-foreground"
          >
            <ShareIcon />
          </button>
          <button
            type="button"
            title="More options (decorative)"
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted/20 hover:text-foreground"
          >
            <DotsIcon />
          </button>

          <div className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

          {/* Panel toggle button */}
          <button
            type="button"
            onClick={() => setIsDetailsPanelVisible((v) => !v)}
            aria-label={isDetailsPanelVisible ? "Hide details panel" : "Show details panel"}
            title={isDetailsPanelVisible ? "Hide details panel" : "Show details panel"}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              isDetailsPanelVisible
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/20 hover:text-foreground"
            }`}
          >
            <PanelToggleIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-6">
          {/* Title & Description */}
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
              className="w-full rounded-md -mx-1 px-1 border-none bg-transparent text-2xl font-bold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="mt-2 w-full resize-none rounded-md -mx-1 px-1 border-none bg-transparent text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring leading-relaxed"
            />
          </div>

          {/* Properties, Labels & Resources matching Figma */}
          <div className="space-y-2.5 rounded-xl border border-border bg-card p-4 text-xs">
            {/* Properties Row */}
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium text-muted-foreground">Properties</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-medium text-foreground">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-bold text-white">
                    A
                  </span>
                  <span>Designer</span>
                </span>
                {task.dueDate ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] dark:bg-red-950/40 px-2.5 py-0.5 font-medium text-[#ef4444] dark:text-red-400">
                    <CalendarIcon />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Labels Row */}
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium text-muted-foreground">Labels</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(task.labels && task.labels.length > 0
                  ? task.labels
                  : [
                      { id: "1", name: "Research" },
                      { id: "2", name: "Design" },
                      { id: "3", name: "Development" },
                      { id: "4", name: "Testing" },
                      { id: "5", name: "Deployment" },
                    ]
                ).map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-foreground font-medium"
                  >
                    <TagIcon />
                    {label.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Resources Row */}
            <div className="flex items-center gap-4">
              <span className="w-20 font-medium text-muted-foreground">Resources</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <span>@</span>
                <span>Add document or link...</span>
              </button>
            </div>
          </div>

          {/* Subtasks Section with Add, Edit, and Delete actions */}
          <SubtasksList
            subtasks={task.subtasks ?? []}
            onAdd={addSubtask}
            onUpdate={updateSubtask}
            onDelete={deleteSubtask}
          />

          {/* Comments Section matching Figma */}
          <CommentsThread comments={task.comments ?? []} onAddComment={addComment} />

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="text-xs text-destructive hover:underline pt-2 block"
          >
            Delete task
          </button>
        </div>

        {/* Right Details Panel */}
        {isDetailsPanelVisible ? (
          <TaskDetailsPanel
            task={task}
            activities={task.activities ?? []}
            onStatusChange={(status: TaskStatus) => updateTask({ status })}
            onPriorityChange={(priority: Priority) => updateTask({ priority })}
            onDateRangeChange={(startDate?: string, dueDate?: string) =>
              updateTask({
                startDate: startDate ? new Date(startDate).toISOString() : undefined,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
              })
            }
          />
        ) : null}
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

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.5 3.5L5 7L8.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3" y="6.5" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 6.5V4.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1.5 8s2.5-4.5 6.5-4.5 6.5 4.5 6.5 4.5-2.5 4.5-6.5 4.5-6.5-4.5-6.5-4.5z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.8 7.1l4.4-2.2M5.8 8.9l4.4 2.2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

function PanelToggleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2" y="2.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M11.5 2.5V15.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 5H10.5M4 1.5V3M8 1.5V3" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="text-muted-foreground">
      <path
        d="M2 7.5V3a1 1 0 011-1h4.5a1 1 0 01.7.3l5.5 5.5a1 1 0 010 1.4l-4.5 4.5a1 1 0 01-1.4 0L2.3 8.2A1 1 0 012 7.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5" cy="5" r="1" fill="currentColor" />
    </svg>
  );
}
