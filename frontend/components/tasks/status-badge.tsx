import type { TaskStatus, Priority } from "@/types/task";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/types/task";

const STATUS_DOT_COLOR: Record<TaskStatus, string> = {
  TODO: "bg-gray-400",
  DOING: "bg-blue-500",
  COMPLETED: "bg-green-500",
  ON_HOLD: "bg-orange-500",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
      <span
        className={`h-2 w-2 rounded-full ${STATUS_DOT_COLOR[status]}`}
        aria-hidden="true"
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

const PRIORITY_STYLE: Record<Priority, { color: string; icon: React.ReactNode }> = {
  NO_PRIORITY: { color: "text-muted-foreground", icon: <DashIcon /> },
  URGENT: { color: "text-red-600", icon: <BarsIcon count={3} /> },
  HIGH: { color: "text-orange-500", icon: <BarsIcon count={3} /> },
  MEDIUM: { color: "text-amber-500", icon: <BarsIcon count={2} /> },
  LOW: { color: "text-gray-400", icon: <BarsIcon count={1} /> },
};

// Priority is communicated via an icon (bar count) AND color AND the text
// label - never color alone, per the accessibility requirement, so it's
// still legible to colorblind users or in grayscale.
export function PriorityBadge({ priority }: { priority: Priority }) {
  const { color, icon } = PRIORITY_STYLE[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      {icon}
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

function BarsIcon({ count }: { count: number }) {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i * 4}
          y={10 - (i + 1) * 3}
          width="2.5"
          height={(i + 1) * 3}
          rx="0.5"
          fill={i < count ? "currentColor" : "currentColor"}
          opacity={i < count ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
      <rect x="1" y="4.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}
