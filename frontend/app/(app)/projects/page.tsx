"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAppLayout } from "@/app/(app)/layout";
import { useProjects } from "@/hooks/use-projects";
import { ProjectsTable } from "@/components/projects/projects-table";
import { ProjectForm } from "@/components/projects/project-form";
import { ConfirmDialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { ErrorState } from "@/components/states/error-state";
import type { Project, CreateProjectInput } from "@/types/project";

export default function ProjectsPage() {
  const { openSidebar } = useAppLayout();
  const { projects, isLoading, error, refetch, createProject, updateProject, removeProject } =
    useProjects();

  const [formState, setFormState] = useState<
    { mode: "create" } | { mode: "edit"; project: Project } | null
  >(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleFormSubmit(input: CreateProjectInput) {
    if (formState?.mode === "edit") {
      await updateProject(formState.project.id, input);
    } else {
      await createProject(input);
    }
  }

  async function handleConfirmDelete() {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await removeProject(projectToDelete.id);
      setProjectToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Projects" onMenuClick={openSidebar}>
        <Button onClick={() => setFormState({ mode: "create" })}>+ Add Project</Button>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {isLoading ? (
          <LoadingState rows={4} />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Create your first project to group related tasks together."
            action={
              <Button size="sm" onClick={() => setFormState({ mode: "create" })}>
                + Add Project
              </Button>
            }
          />
        ) : (
          <ProjectsTable
            projects={projects}
            onEdit={(project) => setFormState({ mode: "edit", project })}
            onDelete={(project) => setProjectToDelete(project)}
          />
        )}
      </div>

      <ProjectForm
        key={formState?.mode === "edit" ? `edit-${formState.project.id}` : "create"}
        isOpen={!!formState}
        onClose={() => setFormState(null)}
        onSubmit={handleFormSubmit}
        onDelete={
          formState?.mode === "edit"
            ? () => {
                setProjectToDelete(formState.project);
                setFormState(null);
              }
            : undefined
        }
        initialProject={formState?.mode === "edit" ? formState.project : undefined}
      />

      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="Delete this project?"
        description={`"${projectToDelete?.name}" will be permanently deleted. Tasks in this project will be unassigned, not deleted. This can't be undone.`}
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
