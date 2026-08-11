import type { Task } from "@/types/task";
import { PriorityBadge } from "./status-badge";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left shadow-sm
        hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="text-sm font-medium text-card-foreground">{task.title}</p>

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.dueDate ? (
          <span className="flex items-center gap-1 text-xs text-red-500">
            <CalendarIcon />
            {formatDate(task.dueDate)}
          </span>
        ) : null}
      </div>

      {task.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="rounded-md bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {label.name}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M1.5 5H10.5M4 1.5V3M8 1.5V3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
