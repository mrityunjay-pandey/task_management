"use client";

import { useState } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { TASK_STATUSES, STATUS_LABELS } from "@/types/task";
import { PriorityBadge } from "./status-badge";

import type { VisibleFields } from "./fields-menu";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onDeleteTask: (task: Task) => void;
  visibleFields: VisibleFields;
}

export function TaskList({
  tasks,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  visibleFields,
}: TaskListProps) {
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(new Set());

  function toggle(status: TaskStatus) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {TASK_STATUSES.map((status) => {
        const groupTasks = tasks.filter((t) => t.status === status);
        const isCollapsed = collapsed.has(status);

        return (
          <div key={status}>
            <button
              onClick={() => toggle(status)}
              aria-expanded={!isCollapsed}
              className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <ChevronIcon collapsed={isCollapsed} />
              {STATUS_LABELS[status]}
              <span className="text-xs text-muted-foreground">{groupTasks.length}</span>
            </button>

            {!isCollapsed ? (
              <div className="overflow-x-auto rounded-lg border border-border">
                {groupTasks.length > 0 ? (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-card text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Task</th>
                        {visibleFields.priority ? (
                          <th className="hidden px-4 py-2 font-medium sm:table-cell">
                            Priority
                          </th>
                        ) : null}
                        {visibleFields.dueDate ? (
                          <th className="hidden px-4 py-2 font-medium md:table-cell">
                            Due Date
                          </th>
                        ) : null}
                        <th className="w-10 px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {groupTasks.map((task) => (
                        <tr
                          key={task.id}
                          className="cursor-pointer border-t border-border hover:bg-card/60"
                          onClick={() => onTaskClick(task)}
                        >
                          <td className="max-w-[240px] truncate px-4 py-2.5 text-card-foreground">
                            {task.title}
                          </td>
                          {visibleFields.priority ? (
                            <td className="hidden px-4 py-2.5 sm:table-cell">
                              <PriorityBadge priority={task.priority} />
                            </td>
                          ) : null}
                          {visibleFields.dueDate ? (
                            <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                          ) : null}
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task);
                              }}
                              aria-label={`Delete ${task.title}`}
                              className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                            >
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    No tasks in {STATUS_LABELS[status]}
                  </p>
                )}
                <button
                  onClick={() => onAddTask(status)}
                  className="flex w-full items-center gap-1 border-t border-border px-4 py-2 text-left text-sm text-muted-foreground hover:bg-card"
                >
                  <PlusIcon /> Add Task
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
    >
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 4H11.5M5.5 4V2.5H8.5V4M5.5 6.5V10M8.5 6.5V10M3.5 4L4 11.5H10L10.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
