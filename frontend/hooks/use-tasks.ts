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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tasksService.list(query);
      setTasks(result);
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
  }, [query.status, query.priority, query.search, query.projectId]);

  useEffect(() => {
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
