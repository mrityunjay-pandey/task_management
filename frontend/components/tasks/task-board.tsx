"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { TASK_STATUSES, STATUS_LABELS } from "@/types/task";
import { TaskCard } from "./task-card";
import type { VisibleFields } from "./fields-menu";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  visibleFields?: VisibleFields;
}

export function TaskBoard({
  tasks,
  onTaskClick,
  onAddTask,
  onStatusChange,
  visibleFields,
}: TaskBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  function handleDragOver(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  }

  function handleDragLeave(e: React.DragEvent, status: TaskStatus) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  }

  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId && onStatusChange) {
      onStatusChange(taskId, status);
    }
  }

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-2">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        const isDragOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className="flex w-72 shrink-0 flex-col"
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={(e) => handleDragLeave(e, status)}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <span className="text-muted-foreground/60 cursor-grab" aria-hidden="true">
                  <GripIcon />
                </span>
                {STATUS_LABELS[status]}
                <span className="text-xs font-semibold text-muted-foreground">
                  {columnTasks.length}
                </span>
              </span>

              <span className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onAddTask(status)}
                  aria-label={`Add task to ${STATUS_LABELS[status]}`}
                  className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <PlusIcon />
                </button>
                <button
                  type="button"
                  aria-label={`${STATUS_LABELS[status]} column options`}
                  className="rounded-md p-1 text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MoreIcon />
                </button>
              </span>
            </div>

            {/* Column Cards Drop Area */}
            <div
              className={`flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-xl p-1.5 transition-colors duration-150 ${
                isDragOver
                  ? "bg-accent/10 border-2 border-dashed border-accent"
                  : "bg-card/40 border border-transparent"
              }`}
            >
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                  visibleFields={visibleFields}
                />
              ))}

              <button
                type="button"
                onClick={() => onAddTask(status)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PlusIcon /> Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GripIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden="true">
      {[0, 1, 2].map((row) =>
        [0, 1].map((col) => (
          <circle key={`${row}-${col}`} cx={col === 0 ? 2.5 : 7.5} cy={2 + row * 5} r="1.2" fill="currentColor" />
        )),
      )}
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="3" cy="7" r="1.1" fill="currentColor" />
      <circle cx="7" cy="7" r="1.1" fill="currentColor" />
      <circle cx="11" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
