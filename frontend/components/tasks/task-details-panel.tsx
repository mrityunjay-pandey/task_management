"use client";

import { Select } from "@/components/ui/select";
import { TASK_STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from "@/types/task";
import type { Task, TaskStatus, Priority, Activity } from "@/types/task";

interface TaskDetailsPanelProps {
  task: Task;
  activities: Activity[];
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: Priority) => void;
  onDueDateChange: (dueDate: string) => void;
}

export function TaskDetailsPanel({
  task,
  activities,
  onStatusChange,
  onPriorityChange,
  onDueDateChange,
}: TaskDetailsPanelProps) {
  return (
    <div className="flex w-full flex-col gap-6 lg:w-72 lg:shrink-0">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground">Details</h3>
        <div className="flex flex-col gap-3">
          <Select
            label="Status"
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>

          <Select
            label="Priority"
            value={task.priority}
            onChange={(e) => onPriorityChange(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="due-date" className="text-sm font-medium text-foreground">
              Due Date
            </label>
            <input
              id="due-date"
              type="date"
              value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
              onChange={(e) => onDueDateChange(e.target.value)}
              className="h-10 rounded-lg border border-input-border bg-card px-3 text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {task.labels.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Labels</span>
              <div className="flex flex-wrap gap-1">
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-card-foreground">Updates</h3>
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Changes to status and priority will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {activities.map((activity) => (
              <li key={activity.id} className="text-xs text-muted-foreground">
                <span className="text-foreground">You</span> {activity.message}
                <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                  {new Date(activity.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
