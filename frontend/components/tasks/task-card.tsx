import type { Task } from "@/types/task";
import { PriorityBadge } from "./status-badge";
import type { VisibleFields } from "./fields-menu";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onMenuClick?: (e: React.MouseEvent, task: Task) => void;
  visibleFields?: VisibleFields;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export function TaskCard({
  task,
  onClick,
  onMenuClick,
  visibleFields,
  onDragStart,
}: TaskCardProps) {
  const showPriority = visibleFields?.priority ?? true;
  const showDueDate = visibleFields?.dueDate ?? true;
  const showMembers = visibleFields?.members ?? true;
  const showLabels = visibleFields?.labels ?? true;

  const memberName =
    task.members && task.members.length > 0
      ? task.members[0].user.guestName
      : "Admin";

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        if (onDragStart) onDragStart(e, task);
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative flex w-full cursor-grab active:cursor-grabbing flex-col gap-2.5 rounded-xl border border-border bg-card p-3.5 text-left shadow-xs transition-all hover:border-foreground/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Title & ... Action Menu */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-card-foreground line-clamp-2 leading-snug">
          {task.title}
        </p>
        <button
          type="button"
          aria-label={`Task options for ${task.title}`}
          onClick={(e) => {
            e.stopPropagation();
            if (onMenuClick) {
              onMenuClick(e, task);
            }
          }}
          className="rounded p-0.5 text-muted-foreground opacity-60 hover:bg-background hover:opacity-100 focus-visible:opacity-100"
        >
          <DotsHorizontalIcon />
        </button>
      </div>

      {/* Member Avatar + Name & Date Pill Badge matching Figma */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {showMembers ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-white shadow-xs"
              aria-hidden="true"
            >
              {memberName[0]?.toUpperCase() ?? "A"}
            </span>
            <span className="truncate font-normal text-muted-foreground">{memberName}</span>
          </div>
        ) : <div />}

        {showDueDate && task.dueDate ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#fef2f2] dark:bg-red-950/40 px-2.5 py-0.5 text-[11px] font-medium text-[#ef4444] dark:text-red-400">
            <CalendarIcon />
            {formatDate(task.dueDate)}
          </span>
        ) : null}
      </div>

      {/* Priority Badge (if enabled and set) */}
      {showPriority && task.priority !== "NO_PRIORITY" ? (
        <div>
          <PriorityBadge priority={task.priority} />
        </div>
      ) : null}

      {/* Labels / Tags matching Figma with Tag Icon */}
      {showLabels && task.labels && task.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-normal text-foreground shadow-2xs"
            >
              <TagIcon />
              {label.name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
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

function DotsHorizontalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}
