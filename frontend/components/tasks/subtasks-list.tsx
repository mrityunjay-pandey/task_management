"use client";

import { useState, useRef, useEffect } from "react";
import type { Task, Priority, CreateTaskInput, UpdateTaskInput } from "@/types/task";
import { PRIORITIES, PRIORITY_LABELS } from "@/types/task";
import { PriorityBadge } from "./status-badge";
import { Button } from "@/components/ui/button";

interface SubtasksListProps {
  subtasks: Task[];
  onAdd: (input: CreateTaskInput) => Promise<void>;
  onUpdate?: (subtaskId: string, input: UpdateTaskInput) => Promise<void>;
  onDelete?: (subtaskId: string) => Promise<void>;
}

export function SubtasksList({
  subtasks,
  onAdd,
  onUpdate,
  onDelete,
}: SubtasksListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("NO_PRIORITY");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For editing a subtask
  const [editingSubtask, setEditingSubtask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("NO_PRIORITY");
  const [editDueDate, setEditDueDate] = useState("");

  // For row actions menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd({
        title: trimmed,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      setTitle("");
      setPriority("NO_PRIORITY");
      setDueDate("");
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSubtask || !onUpdate) return;
    const trimmed = editTitle.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      await onUpdate(editingSubtask.id, {
        title: trimmed,
        priority: editPriority,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      });
      setEditingSubtask(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(subtask: Task) {
    setEditingSubtask(subtask);
    setEditTitle(subtask.title);
    setEditPriority(subtask.priority);
    setEditDueDate(subtask.dueDate ? subtask.dueDate.slice(0, 10) : "");
    setActiveMenuId(null);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsCollapsed((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-muted-foreground"
      >
        <ChevronIcon collapsed={isCollapsed} />
        <span>Subtasks</span>
        {subtasks.length > 0 ? (
          <span className="text-xs font-normal text-muted-foreground">({subtasks.length})</span>
        ) : null}
      </button>

      {!isCollapsed ? (
        <div className="relative rounded-xl border border-border bg-card overflow-visible">
          {/* Table */}
          {subtasks.length > 0 ? (
            <div className="overflow-visible">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20 text-left font-medium text-muted-foreground">
                    <th className="px-4 py-2.5">Task</th>
                    <th className="px-4 py-2.5">Priority</th>
                    <th className="px-4 py-2.5">Members</th>
                    <th className="px-4 py-2.5">Due Date</th>
                    <th className="w-12 px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border overflow-visible">
                  {subtasks.map((subtask) => (
                    <tr key={subtask.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[220px] truncate">
                        {subtask.title}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={subtask.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[9px] font-semibold text-white">
                          A
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {subtask.dueDate
                          ? new Date(subtask.dueDate).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right overflow-visible">
                        <SubtaskActionMenu
                          isOpen={activeMenuId === subtask.id}
                          onToggle={() =>
                            setActiveMenuId(activeMenuId === subtask.id ? null : subtask.id)
                          }
                          onClose={() => setActiveMenuId(null)}
                          onEdit={() => startEdit(subtask)}
                          onPriorityChange={async (p) => {
                            if (onUpdate) await onUpdate(subtask.id, { priority: p });
                            setActiveMenuId(null);
                          }}
                          onDelete={async () => {
                            if (onDelete) await onDelete(subtask.id);
                            setActiveMenuId(null);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-4 text-xs text-muted-foreground">No subtasks yet.</div>
          )}

          {/* Add Subtask Form / Button */}
          {isAdding ? (
            <form onSubmit={handleAdd} className="border-t border-border bg-muted/10 p-3.5 space-y-3">
              <div className="text-xs font-semibold text-foreground">Add New Subtask</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Subtask title..."
                    autoFocus
                    className="h-8 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="h-8 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-8 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Add Subtask
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex w-full items-center gap-1.5 border-t border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-colors"
            >
              <PlusIcon /> Add Subtasks
            </button>
          )}
        </div>
      ) : null}

      {/* Edit Subtask Modal Dialog */}
      {editingSubtask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-xl space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Edit Subtask</h4>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as Priority)}
                  className="h-8 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input-border bg-card px-2.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingSubtask(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SubtaskActionMenu({
  isOpen,
  onToggle,
  onClose,
  onEdit,
  onPriorityChange,
  onDelete,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onEdit: () => void;
  onPriorityChange: (priority: Priority) => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label="Subtask options"
        onClick={onToggle}
        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <DotsHorizontalIcon />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-border bg-card p-1.5 shadow-2xl text-xs">
          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-foreground hover:bg-muted/30 transition-colors"
          >
            Edit Subtask
          </button>

          <div className="my-1 border-t border-border" />
          <div className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
            Set Priority
          </div>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPriorityChange(p)}
              className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1 text-left text-foreground hover:bg-muted/30 transition-colors"
            >
              <PriorityBadge priority={p} />
            </button>
          ))}

          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-destructive hover:bg-destructive/10 transition-colors"
          >
            Delete Subtask
          </button>
        </div>
      ) : null}
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
      className={`transition-transform duration-150 ${collapsed ? "-rotate-90" : ""}`}
    >
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

function DotsHorizontalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}
