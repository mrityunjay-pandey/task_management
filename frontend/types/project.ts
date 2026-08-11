import type { Priority } from "./task";

export interface Project {
  id: string;
  name: string;
  priority: Priority;
  dueDate: string | null;
  leadId: string;
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  priority?: Priority;
  dueDate?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;
