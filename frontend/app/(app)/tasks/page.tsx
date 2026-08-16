"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useAppLayout } from "@/app/(app)/layout";
import { useTasks } from "@/hooks/use-tasks";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { FieldsMenu } from "@/components/tasks/fields-menu";
import type { VisibleFields } from "@/components/tasks/fields-menu";
import { FilterMenu } from "@/components/tasks/filter-menu";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import type { Task, TaskStatus, Priority, CreateTaskInput } from "@/types/task";

type ViewMode = "board" | "list";

export default function TasksPage() {
  const router = useRouter();
  const { openSidebar } = useAppLayout();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>();
  const [visibleFields, setVisibleFields] = useState<VisibleFields>({
    priority: true,
    dueDate: true,
  });

  const { tasks, isLoading, error, refetch, createTask, removeTask } = useTasks({
    search: search || undefined,
    status: statusFilter,
    priority: priorityFilter,
  });

  // Create-only now - clicking an existing task navigates to its detail
  // page instead, matching the Figma interaction (full page swap, not a modal).
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasAnyTasks = tasks.length > 0;

  async function handleCreateSubmit(input: CreateTaskInput) {
    await createTask(input);
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

  function goToTask(task: Task) {
    router.push(`/tasks/${task.id}`);
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

        <FieldsMenu fields={visibleFields} onChange={setVisibleFields} />
        <FilterMenu
          status={statusFilter}
          priority={priorityFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
        />

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

        <Button onClick={() => setCreateStatus("TODO")}>+ Add Task</Button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {isLoading ? (
          <LoadingState rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : !hasAnyTasks ? (
          <EmptyState
            title={search || statusFilter || priorityFilter ? "No tasks found" : "No tasks yet"}
            description={
              search || statusFilter || priorityFilter
                ? "Try a different search term or filter."
                : "Create your first task to get started."
            }
            action={
              !search && !statusFilter && !priorityFilter ? (
                <Button size="sm" onClick={() => setCreateStatus("TODO")}>
                  + Add Task
                </Button>
              ) : undefined
            }
          />
        ) : viewMode === "board" ? (
          <TaskBoard
            tasks={tasks}
            onTaskClick={goToTask}
            onAddTask={(status) => setCreateStatus(status)}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onTaskClick={goToTask}
            onAddTask={(status) => setCreateStatus(status)}
            onDeleteTask={(task) => setTaskToDelete(task)}
            visibleFields={visibleFields}
          />
        )}
      </div>

      <TaskForm
        key={createStatus ?? "closed"}
        isOpen={createStatus !== null}
        onClose={() => setCreateStatus(null)}
        onSubmit={handleCreateSubmit}
        defaultStatus={createStatus ?? undefined}
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
