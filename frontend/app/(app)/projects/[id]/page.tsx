"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
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
  const { toggleSidebar } = useAppLayout();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(`viewMode_project_${projectId}`, "list");

  // Reuse the exact same task data/mutation hook as the main Tasks page,
  // just scoped to this project via the projectId filter - same CRUD logic,
  // no duplicated fetching code.
  const { tasks, isLoading, error, refetch, createTask, updateStatus, removeTask } = useTasks({
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

  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleCreateSubmit(input: CreateTaskInput) {
    await createTask({ ...input, projectId });
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

  if (projectError) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Project" onMenuClick={toggleSidebar} />
        <div className="flex-1 p-6">
          <ErrorState message={projectError} onRetry={() => router.push("/projects")} />
        </div>
      </div>
    );
  }

  const projectVisibleFields = {
    priority: true,
    dueDate: true,
    members: true,
    status: true,
    labels: true,
    reporter: false,
  };

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
        onMenuClick={toggleSidebar}
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
        <Button onClick={() => setCreateStatus("TODO")}>+ Add Task</Button>
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
              <Button size="sm" onClick={() => setCreateStatus("TODO")}>
                + Add Task
              </Button>
            }
          />
        ) : viewMode === "board" ? (
          <TaskBoard
            tasks={tasks}
            onTaskClick={goToTask}
            onAddTask={(status) => setCreateStatus(status)}
            onStatusChange={updateStatus}
            visibleFields={projectVisibleFields}
          />
        ) : (
          <TaskList
            tasks={tasks}
            onTaskClick={goToTask}
            onAddTask={(status) => setCreateStatus(status)}
            onDeleteTask={(task) => setTaskToDelete(task)}
            visibleFields={projectVisibleFields}
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
