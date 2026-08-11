"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { useAppLayout } from "@/app/(app)/layout";
import { useTasks } from "@/hooks/use-tasks";
import { projectsService } from "@/services/projects.service";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskForm } from "@/components/tasks/task-form";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import type { Project } from "@/types/project";
import type { Task, TaskStatus, CreateTaskInput } from "@/types/task";
import { ApiError } from "@/lib/api";

type ViewMode = "board" | "list";

export default function ProjectDetailPage() {
  const { openSidebar } = useAppLayout();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Reuse the exact same task data/mutation hook as the main Tasks page,
  // just scoped to this project via the projectId filter - same CRUD logic,
  // no duplicated fetching code.
  const { tasks, isLoading, error, refetch, createTask, updateTask, removeTask } = useTasks({
    projectId,
  });

  useEffect(() => {
    let cancelled = false;
    projectsService
      .get(projectId)
      .then((p) => {
        if (!cancelled) setProject(p);
      })
      .catch((err) => {
        if (!cancelled) {
          setProjectError(
            err instanceof ApiError ? err.message : "Couldn't load this project.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const [formState, setFormState] = useState<
    { mode: "create"; status: TaskStatus } | { mode: "edit"; task: Task } | null
  >(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleFormSubmit(input: CreateTaskInput) {
    if (formState?.mode === "edit") {
      await updateTask(formState.task.id, input);
    } else {
      await createTask({ ...input, projectId });
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

  if (projectError) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Project" onMenuClick={openSidebar} />
        <div className="flex-1 p-6">
          <ErrorState message={projectError} onRetry={() => router.push("/projects")} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={
          <div className="flex items-center gap-1.5 text-sm">
            <Link href="/projects" className="font-normal text-muted-foreground hover:underline">
              Projects
            </Link>
            <span className="font-normal text-muted-foreground">/</span>
            <span className="font-semibold text-foreground">{project?.name ?? "…"}</span>
          </div>
        }
        onMenuClick={openSidebar}
      >
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
          <LoadingState rows={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks in this project yet"
            action={
              <Button
                size="sm"
                onClick={() => setFormState({ mode: "create", status: "TODO" })}
              >
                + Add Task
              </Button>
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
