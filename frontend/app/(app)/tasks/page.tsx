"use client";

import { useState, useRef, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
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
  const { toggleSidebar } = useAppLayout();
  const [search, setSearch] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("viewMode_tasks", "board");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>();
  const [visibleFields, setVisibleFields] = useLocalStorage<VisibleFields>("visibleFields_tasks", {
    priority: true,
    dueDate: true,
    members: true,
    status: true,
    labels: true,
    reporter: false,
  });

  const { tasks, isLoading, error, refetch, createTask, updateStatus, removeTask } = useTasks({
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

  // Keyboard shortcut (⌘F / Ctrl+F) to expand & focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setIsSearchExpanded(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearchExpand() {
    setIsSearchExpanded(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  function handleSearchBlur() {
    if (!search) {
      setIsSearchExpanded(false);
    }
  }

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
      <PageHeader title="Tasks" onMenuClick={toggleSidebar}>
        {/* Expandable Search matching Figma */}
        {isSearchExpanded ? (
          <div className="relative flex items-center">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={handleSearchBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  if (!search) setIsSearchExpanded(false);
                }
              }}
              placeholder="Search tasks..."
              aria-label="Search tasks"
              className="h-9 w-48 sm:w-64 rounded-lg border border-input-border bg-card pl-8 pr-12 text-sm text-card-foreground placeholder:text-muted-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <span
              className="pointer-events-none absolute right-2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
              aria-hidden="true"
            >
              ⌘F
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSearchExpand}
            aria-label="Search tasks"
            title="Search tasks (⌘F)"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SearchIcon />
          </button>
        )}

        {/* Fields Dropdown (includes List/Board switcher and column visibility) */}
        <FieldsMenu
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          fields={visibleFields}
          onChange={setVisibleFields}
        />

        {/* Nested Filter Dropdown */}
        <FilterMenu
          status={statusFilter}
          priority={priorityFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
        />

        {/* Add Task Button */}
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
            onStatusChange={updateStatus}
            visibleFields={visibleFields}
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
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={className}>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
