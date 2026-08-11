import { apiFetch } from "@/lib/api";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import type { Task } from "@/types/task";

export const projectsService = {
  list: () => apiFetch<Project[]>("/projects"),

  get: (id: string) => apiFetch<Project>(`/projects/${id}`),

  create: (input: CreateProjectInput) =>
    apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(input) }),

  update: (id: string, input: UpdateProjectInput) =>
    apiFetch<Project>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),

  remove: (id: string) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),

  listTasks: (id: string) => apiFetch<Task[]>(`/projects/${id}/tasks`),
};
