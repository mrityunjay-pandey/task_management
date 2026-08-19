"use client";

import { useState, useEffect, useCallback } from "react";
import { tasksService } from "@/services/tasks.service";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  TaskStatus,
} from "@/types/task";
import { ApiError } from "@/lib/api";

// Centralizes task data fetching + mutations so both the Board and List
// views (and the Create/Edit forms) share one source of truth instead of
// each fetching independently. Uses a simple "refetch after mutation"
// pattern rather than optimistic updates - simpler to reason about and
// explain, at the cost of a brief loading flicker on each action.
export function useTasks(query: TaskQuery) {
  // Create a unique key for the current query (e.g., project specific or global)
  const storageKey = query.projectId ? `project_tasks_${query.projectId}` : "all_tasks";

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tasksService.list(query);
      setTasks(result);
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, JSON.stringify(result));
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load tasks. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
    // Re-run whenever any filter value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.status, query.priority, query.search, query.projectId, storageKey]);

  useEffect(() => {
    // This is React's own documented "fetching data" effect pattern
    // (see react.dev/learn/synchronizing-with-effects#fetching-data) - re-run
    // whenever a filter changes. The newer set-state-in-effect lint rule
    // flags this because it can't statically verify the call graph, but
    // rewriting this as a non-effect (e.g. via Suspense + `use()`) would add
    // real complexity for no behavioral benefit in an app this size.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, [fetchTasks]);

  async function createTask(input: CreateTaskInput) {
    await tasksService.create(input);
    await fetchTasks();
  }

  async function updateTask(id: string, input: UpdateTaskInput) {
    await tasksService.update(id, input);
    await fetchTasks();
  }

  async function updateStatus(id: string, status: TaskStatus) {
    await tasksService.updateStatus(id, status);
    await fetchTasks();
  }

  async function removeTask(id: string) {
    await tasksService.remove(id);
    await fetchTasks();
  }

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    updateStatus,
    removeTask,
  };
}
