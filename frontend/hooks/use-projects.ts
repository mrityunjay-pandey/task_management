"use client";

import { useState, useEffect, useCallback } from "react";
import { projectsService } from "@/services/projects.service";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project";
import { ApiError } from "@/lib/api";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await projectsService.list();
      setProjects(result);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't load projects. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Same documented React data-fetching pattern as useTasks - see the
    // comment there for why the lint rule is suppressed rather than worked around.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  async function createProject(input: CreateProjectInput) {
    await projectsService.create(input);
    await fetchProjects();
  }

  async function updateProject(id: string, input: UpdateProjectInput) {
    await projectsService.update(id, input);
    await fetchProjects();
  }

  async function removeProject(id: string) {
    await projectsService.remove(id);
    await fetchProjects();
  }

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    removeProject,
  };
}
