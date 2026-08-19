"use client";

import { useState, useEffect, useCallback } from "react";
import { tasksService } from "@/services/tasks.service";
import type { Task, UpdateTaskInput, CreateTaskInput } from "@/types/task";
import { ApiError } from "@/lib/api";

export function useTaskDetail(taskId: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await tasksService.get(taskId);
      setTask(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load this task.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTask();
  }, [fetchTask]);

  async function updateTask(input: UpdateTaskInput) {
    await tasksService.update(taskId, input);
    await fetchTask();
  }

  async function addSubtask(input: CreateTaskInput) {
    await tasksService.createSubtask(taskId, input);
    await fetchTask();
  }

  async function updateSubtask(subtaskId: string, input: UpdateTaskInput) {
    await tasksService.update(subtaskId, input);
    await fetchTask();
  }

  async function deleteSubtask(subtaskId: string) {
    await tasksService.remove(subtaskId);
    await fetchTask();
  }

  async function addComment(content: string) {
    await tasksService.addComment(taskId, content);
    await fetchTask();
  }

  async function removeTask() {
    await tasksService.remove(taskId);
  }

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask,
    updateTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    removeTask,
  };
}
