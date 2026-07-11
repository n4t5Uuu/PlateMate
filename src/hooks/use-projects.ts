"use client"

import {useState, useEffect} from "react";
import {projectHelper} from "@/lib/project-helper";
import {Project} from "@/types/project.types"
import { browserSupabase } from "@/lib/supabase/browser";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Custom hook to manage projects for a user.
 * It provides functionality to fetch, create, update, and delete projects.
 * 
 * @param userIdOverride - Optional user ID to fetch projects for. If not provided, it defaults to the current logged-in user.
 * @returns An object containing the projects array, loading state, error message, and CRUD operations.
 */
export function useProjects(userIdOverride?: string) {
    const { user, loading: authLoading } = useAuth();
    const userId = userIdOverride || user?.id;

    const [projects, setProjects] = useState<Project[]>([]);
    // Tracks database loading state locally during CRUD / fetches
    const [dbLoading, setDbLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetches the projects list from the database.
     * Clears the projects if no user ID is available.
     */
    const fetchProjects = async () => {
        if (!userId) {
            setProjects([]);
            return;
        }

        setDbLoading(true);   
        setError(null);

        const result = await projectHelper.getProjects(browserSupabase, userId);

        if(result.success){
            setProjects(result.data as Project[])
        } else {
            setError(result.error || "Failed to fetch projects");
        }

        setDbLoading(false);
    }

    /**
     * React effect that triggers a fetch whenever the userId changes.
     */
    useEffect(() => {
        fetchProjects();
    }, [userId])

    /**
     * Creates a new project in the database and refreshes the projects list.
     * 
     * @param projectData - The data of the new project (excluding generated fields).
     * @returns A promise that resolves to the result of the creation operation.
     */
    const createProject = async (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
        const result = await projectHelper.createProject(browserSupabase, projectData);

        if(result.success) {
            await fetchProjects();
        }

        return result;
    }

    /**
     * Updates an existing project and refreshes the projects list.
     * 
     * @param id - The ID of the project to update.
     * @param projectData - The partial data to update.
     * @returns A promise that resolves to the result of the update operation.
     */
    const updateProject = async (id: string, projectData: Partial<Project>) => {
        const result = await projectHelper.updateProject(browserSupabase, id, projectData);

        if(result.success) {
            await fetchProjects();
        }

        return result;
    }

    /**
     * Deletes a project from the database and refreshes the projects list.
     * 
     * @param projectId - The ID of the project to delete.
     * @returns A promise that resolves to the result of the deletion operation.
     */
    const deleteProject = async (projectId: string) => {
        const result = await projectHelper.deleteProject(browserSupabase, projectId);

        if(result.success) {
            await fetchProjects();
        }

        return result;
    }

    return {
        /** Array of projects for the given user */
        projects,
        /** 
         * Combined loading state: stays true while authentication is initializing
         * OR while database query fetches are in flight to prevent UI flickering.
         */
        loading: (!userIdOverride && authLoading) || dbLoading, 
        /** Error message if an operation fails, null otherwise */
        error,
        /** Function to create a new project */
        createProject,
        /** Function to update an existing project */
        updateProject,
        /** Function to delete a project */
        deleteProject,
        /** Function to manually refresh the projects list */
        refetch: fetchProjects
    }
}