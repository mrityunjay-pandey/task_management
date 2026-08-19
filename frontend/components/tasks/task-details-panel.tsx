"use client";

import { useState, useRef, useEffect } from "react";
import { DateRangePicker } from "./date-range-picker";
import { TASK_STATUSES, PRIORITIES, PRIORITY_LABELS } from "@/types/task";
import type { Task, TaskStatus, Priority, Activity } from "@/types/task";
import { StatusBadge } from "./status-badge";

interface TaskDetailsPanelProps {
  task: Task;
  activities: Activity[];
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: Priority) => void;
  onDateRangeChange: (startDate?: string, dueDate?: string) => void;
}

export function TaskDetailsPanel({
  task,
  activities,
  onStatusChange,
  onPriorityChange,
  onDateRangeChange,
}: TaskDetailsPanelProps) {
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [isUpdatesCollapsed, setIsUpdatesCollapsed] = useState(false);

  return (
    <div className="flex w-full flex-col gap-5 lg:w-80 lg:shrink-0">
      {/* Details Card */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-xs">
        {/* Header with collapse chevron, Title, and Decorative + / Gear icons */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <button
            type="button"
            onClick={() => setIsDetailsCollapsed((v) => !v)}
            aria-expanded={!isDetailsCollapsed}
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-muted-foreground"
          >
            <ChevronIcon collapsed={isDetailsCollapsed} />
            Details
          </button>

          <div className="flex items-center gap-1 text-muted-foreground">
            <span
              title="Add field (decorative)"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/70"
            >
              <PlusIcon />
            </span>
            <span
              title="Panel settings (decorative)"
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground/70"
            >
              <GearIcon />
            </span>
          </div>
        </div>

        {!isDetailsCollapsed ? (
          <div className="space-y-3 text-xs">
            {/* Status Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium min-w-[70px]">Status</span>
              <StatusDropdown status={task.status} onChange={onStatusChange} />
            </div>

            {/* Priority Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium min-w-[70px]">Priority</span>
              <PriorityFlyout priority={task.priority} onChange={onPriorityChange} />
            </div>

            {/* Members Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium min-w-[70px]">Members</span>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-semibold text-white">
                  A
                </span>
                <span className="text-foreground font-medium">
                  {task.members?.[0]?.user.guestName ?? "Admin"}
                </span>
              </div>
            </div>

            {/* Dates Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium min-w-[70px]">Dates</span>
              <div className="flex-1 max-w-[180px]">
                <DateRangePicker
                  startDate={task.startDate}
                  dueDate={task.dueDate}
                  onChange={onDateRangeChange}
                />
              </div>
            </div>

            {/* Labels Row */}
            <div className="flex items-start justify-between gap-2 pt-1">
              <span className="text-muted-foreground font-medium min-w-[70px] pt-0.5">Labels</span>
              <div className="flex flex-wrap justify-end gap-1 flex-1">
                {task.labels && task.labels.length > 0 ? (
                  task.labels.map((label) => (
                    <span
                      key={label.id}
                      className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] text-foreground font-medium"
                    >
                      {label.name}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </div>

            {/* Teams Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium min-w-[70px]">Teams</span>
              <span className="text-muted-foreground">—</span>
            </div>

            {/* Reporter Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium min-w-[70px]">Reporter</span>
              <span className="text-foreground font-medium">Admin</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Updates / Activity Card */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
        <button
          type="button"
          onClick={() => setIsUpdatesCollapsed((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ChevronIcon collapsed={isUpdatesCollapsed} />
            Updates
          </span>
        </button>

        {!isUpdatesCollapsed ? (
          <div>
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground py-1">
                Changes to status and priority will show up here.
              </p>
            ) : (
              <ul className="flex flex-col gap-3 pt-1">
                {activities.map((activity) => (
                  <li key={activity.id} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-foreground">
                      •
                    </span>
                    <div>
                      <p className="text-foreground leading-snug">{activity.message}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {new Date(activity.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StatusDropdown({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted/10 transition-colors"
      >
        <StatusBadge status={status} />
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-border bg-card p-1 shadow-lg text-xs">
          {TASK_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors ${
                s === status ? "bg-muted/30 font-medium text-foreground" : "text-foreground hover:bg-muted/20"
              }`}
            >
              <StatusBadge status={s} />
              {s === status ? <CheckIcon /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PriorityFlyout({
  priority,
  onChange,
}: {
  priority: Priority;
  onChange: (priority: Priority) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground hover:bg-muted/10 transition-colors"
      >
        <PriorityIcon priority={priority} />
        <span className="font-medium">{PRIORITY_LABELS[priority]}</span>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-1 w-44 rounded-xl border border-border bg-card p-1.5 shadow-xl text-xs"
        >
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Priority
          </div>
          {PRIORITIES.map((p) => {
            const isSelected = p === priority;
            return (
              <button
                key={p}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onChange(p);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors ${
                  isSelected ? "bg-muted/30 font-medium text-foreground" : "text-foreground hover:bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <PriorityIcon priority={p} />
                  <span>{PRIORITY_LABELS[p]}</span>
                </div>
                {isSelected ? <CheckIcon /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function PriorityIcon({ priority }: { priority: Priority }) {
  if (priority === "NO_PRIORITY") {
    return (
      <span className="text-muted-foreground">
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
          <rect x="1" y="4.25" width="10" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      </span>
    );
  }

  const count =
    priority === "URGENT" || priority === "HIGH" ? 3 : priority === "MEDIUM" ? 2 : 1;
  const color =
    priority === "URGENT"
      ? "text-red-600"
      : priority === "HIGH"
      ? "text-orange-500"
      : priority === "MEDIUM"
      ? "text-amber-500"
      : "text-gray-400";

  return (
    <span className={color}>
      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={i * 4}
            y={10 - (i + 1) * 3}
            width="2.5"
            height={(i + 1) * 3}
            rx="0.5"
            fill="currentColor"
            opacity={i < count ? 1 : 0.25}
          />
        ))}
      </svg>
    </span>
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
      className={`transition-transform duration-150 ${collapsed ? "-rotate-90" : ""}`}
    >
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
