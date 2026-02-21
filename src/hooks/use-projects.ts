"use client"

import {useState, useEffect} from "react";
import {projectHelper, type Project} from "@/lib/project-helper";
import { browserSupabase } from "@/lib/supabase/supabase-browser";

export function useProject(userId?: string) {
    const [project, setProject] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null); //unsure if lalagyan ng unknown here

    const fetchProjects = async () => {
        setLoading(true);   
        setError(null);

        const result = await projectHelper.getProjects(browserSupabase, userId);

        if(result.success){
            setProject(result?.data as Project[])
        } else {
            setError(result.error);
        }

        setLoading(false);
    }

    useEffect(() => {
        if(userId) 
            fetchProjects();
    }, [userId])

    const createProject = async (projectData: Omit<Project, "id" | "created_at" | "updated_at">) => {
        const result = await projectHelper.createProject(browserSupabase, projectData);

        if(result.success) {
            await fetchProjects();
        }

        return result;
    }

    const updateProject = async (id: string, projectData: Partial<Project>) => {
        const result = await projectHelper.updateProject(browserSupabase, id, projectData);

        if(result.success) {
            await fetchProjects();
        }

        return result;
    }


    return {
        project,
        loading, 
        error,
        createProject,
        updateProject,
        refetch: fetchProjects
    }
}