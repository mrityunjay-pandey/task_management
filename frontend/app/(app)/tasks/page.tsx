"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAppLayout } from "@/app/(app)/layout";
import { useTasks } from "@/hooks/use-tasks";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import type { Task, TaskStatus, CreateTaskInput } from "@/types/task";

type ViewMode = "board" | "list";

export default function TasksPage() {
  const { openSidebar } = useAppLayout();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");

  const { tasks, isLoading, error, refetch, createTask, updateTask, removeTask } =
    useTasks({ search: search || undefined });

  const [formState, setFormState] = useState<
    { mode: "create"; status: TaskStatus } | { mode: "edit"; task: Task } | null
  >(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasAnyTasks = tasks.length > 0;

  async function handleFormSubmit(input: CreateTaskInput) {
    if (formState?.mode === "edit") {
      await updateTask(formState.task.id, input);
    } else {
      await createTask(input);
    }
  }

  async function handleConfirmDelete() {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await removeTask(taskToDelete.id);
      setTaskToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Tasks" onMenuClick={openSidebar}>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
            aria-label="Search tasks"
            className="h-9 rounded-lg border border-input-border bg-card pl-8 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex rounded-lg border border-border p-0.5" role="tablist">
          <button
            role="tab"
            aria-selected={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={`rounded-md px-3 py-1 text-sm ${viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            List
          </button>
          <button
            role="tab"
            aria-selected={viewMode === "board"}
            onClick={() => setViewMode("board")}
            className={`rounded-md px-3 py-1 text-sm ${viewMode === "board" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Board
          </button>
        </div>

        <Button onClick={() => setFormState({ mode: "create", status: "TODO" })}>
          + Add Task
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {isLoading ? (
          <LoadingState rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !hasAnyTasks ? (
          <EmptyState
            title={search ? "No tasks found" : "No tasks yet"}
            description={
              search
                ? "Try a different search term."
                : "Create your first task to get started."
            }
            action={
              !search ? (
                <Button
                  size="sm"
                  onClick={() => setFormState({ mode: "create", status: "TODO" })}
                >
                  + Add Task
                </Button>
              ) : undefined
            }
          />
        ) : viewMode === "board" ? (
          <TaskBoard
            tasks={tasks}
            onTaskClick={(task) => setFormState({ mode: "edit", task })}
            onAddTask={(status) => setFormState({ mode: "create", status })}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onTaskClick={(task) => setFormState({ mode: "edit", task })}
            onAddTask={(status) => setFormState({ mode: "create", status })}
            onDeleteTask={(task) => setTaskToDelete(task)}
          />
        )}
      </div>

      <TaskForm
        key={
          formState?.mode === "edit"
            ? `edit-${formState.task.id}`
            : formState?.mode === "create"
              ? `create-${formState.status}`
              : "closed"
        }
        isOpen={!!formState}
        onClose={() => setFormState(null)}
        onSubmit={handleFormSubmit}
        onDelete={
          formState?.mode === "edit"
            ? () => {
                setTaskToDelete(formState.task);
                setFormState(null);
              }
            : undefined
        }
        initialTask={formState?.mode === "edit" ? formState.task : undefined}
        defaultStatus={formState?.mode === "create" ? formState.status : undefined}
      />

      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete this task?"
        description={`"${taskToDelete?.title}" will be permanently deleted. This can't be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
