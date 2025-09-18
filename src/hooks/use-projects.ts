"use client"

import {useState, useEffect} from "react";
import {dataHelper, type Project} from "@/lib/data-helper";

export function useProject(userId?: string) {
    const [project, setProject] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<unknown>(null); //unsure if lalagyan ng unknown here

    const fetchProjects = async () => {
        setLoading(true);   
        setError(null);

        const result = await dataHelper.getProjects();

        if(result.success){
            setProject(result?.projects as Project[])
        } else {
            setError(result.error);
        }

        setLoading(false);
    }

    useEffect(() => {
        if(userId) 
            fetchProjects();
    }, [userId])

    const createProject = async (projectData: Omit<Project, "id" | "created" | "updated">) => {
        const result = await dataHelper.createProject(projectData);

        if(result.success) {
            await fetchProjects();
        }

        return result;
    }

    const updateProject = async (id: string, projectData: Partial<Project>) => {
        const result = await dataHelper.updateProject(id, projectData);

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