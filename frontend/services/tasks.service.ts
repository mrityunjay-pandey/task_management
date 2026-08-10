import { apiFetch } from "@/lib/api";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery,
  Comment,
  TaskStatus,
} from "@/types/task";

function buildQueryString(query: TaskQuery): string {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  if (query.priority) params.set("priority", query.priority);
  if (query.search) params.set("search", query.search);
  if (query.projectId) params.set("projectId", query.projectId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const tasksService = {
  list: (query: TaskQuery = {}) =>
    apiFetch<Task[]>(`/tasks${buildQueryString(query)}`),

  get: (id: string) => apiFetch<Task>(`/tasks/${id}`),

  create: (input: CreateTaskInput) =>
    apiFetch<Task>("/tasks", { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, input: UpdateTaskInput) =>
    apiFetch<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  updateStatus: (id: string, status: TaskStatus) =>
    apiFetch<Task>(`/tasks/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  remove: (id: string) => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),

  listSubtasks: (id: string) => apiFetch<Task[]>(`/tasks/${id}/subtasks`),

  createSubtask: (id: string, input: CreateTaskInput) =>
    apiFetch<Task>(`/tasks/${id}/subtasks`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  listComments: (id: string) => apiFetch<Comment[]>(`/tasks/${id}/comments`),

  addComment: (id: string, content: string) =>
    apiFetch<Comment>(`/tasks/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),
};
