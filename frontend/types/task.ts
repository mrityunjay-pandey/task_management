export type TaskStatus = "TODO" | "DOING" | "COMPLETED" | "ON_HOLD";
export type Priority = "NO_PRIORITY" | "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export const TASK_STATUSES: TaskStatus[] = ["TODO", "DOING", "COMPLETED", "ON_HOLD"];
export const PRIORITIES: Priority[] = ["NO_PRIORITY", "URGENT", "HIGH", "MEDIUM", "LOW"];

// Display labels matching the exact wording shown in the Figma design
export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  DOING: "Doing",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  NO_PRIORITY: "No Priority",
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export interface Label {
  id: string;
  name: string;
}

export interface TaskMember {
  userId: string;
  user: { id: string; guestName: string };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  projectId: string | null;
  parentTaskId: string | null;
  reporterId: string;
  labels: Label[];
  members: TaskMember[];
  subtasks?: Task[];
  _count?: { comments: number; subtasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
  projectId?: string;
  labelNames?: string[];
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskQuery {
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  projectId?: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: { id: string; guestName: string };
  createdAt: string;
}

export interface Activity {
  id: string;
  message: string;
  createdAt: string;
}
