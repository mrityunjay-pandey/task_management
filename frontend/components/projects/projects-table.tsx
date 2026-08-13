"use client";

import Link from "next/link";
import type { Project } from "@/types/project";
import { PriorityBadge } from "@/components/tasks/status-badge";

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectsTable({ projects, onEdit, onDelete }: ProjectsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-card text-left text-xs text-muted-foreground">
            <th className="px-4 py-2 font-medium">Project</th>
            <th className="hidden px-4 py-2 font-medium sm:table-cell">Priority</th>
            <th className="hidden px-4 py-2 font-medium md:table-cell">Tasks</th>
            <th className="hidden px-4 py-2 font-medium md:table-cell">Due Date</th>
            <th className="w-16 px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-t border-border hover:bg-card/60">
              <td className="max-w-[240px] truncate px-4 py-2.5">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-card-foreground hover:underline"
                >
                  {project.name}
                </Link>
              </td>
              <td className="hidden px-4 py-2.5 sm:table-cell">
                <PriorityBadge priority={project.priority} />
              </td>
              <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                {project._count?.tasks ?? 0}
              </td>
              <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">
                {project.dueDate
                  ? new Date(project.dueDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td className="px-4 py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(project)}
                    aria-label={`Edit ${project.name}`}
                    className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(project)}
                    aria-label={`Delete ${project.name}`}
                    className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 4H11.5M5.5 4V2.5H8.5V4M5.5 6.5V10M8.5 6.5V10M3.5 4L4 11.5H10L10.5 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
