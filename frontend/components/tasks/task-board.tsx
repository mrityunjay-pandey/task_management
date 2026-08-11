import type { Task, TaskStatus } from "@/types/task";
import { TASK_STATUSES, STATUS_LABELS } from "@/types/task";
import { TaskCard } from "./task-card";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function TaskBoard({ tasks, onTaskClick, onAddTask }: TaskBoardProps) {
  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-2">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="flex w-72 shrink-0 flex-col">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {STATUS_LABELS[status]}
                <span className="text-xs text-muted-foreground">
                  {columnTasks.length}
                </span>
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-lg bg-card/40 p-1">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
              ))}

              <button
                onClick={() => onAddTask(status)}
                className="flex items-center gap-1 rounded-lg px-2 py-2 text-left text-sm text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PlusIcon /> Add Task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
