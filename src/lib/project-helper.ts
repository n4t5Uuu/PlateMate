import { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeInput } from "./security";
import { Project } from "@/types/project.types"

/**
 * Maps a database project record to the frontend Project interface.
 * This ensures consistent property names (camelCase) throughout the application.
 * 
 * @param data - The raw data from the database.
 * @returns A formatted Project object.
 */
function mapProjects(data: any): Project {
    return {
        id: data.id,
        title: data.name,
        description: data.description,
        client: data.client_name,
        workspaceId: data.workspace_id,
        owner: data.owner_id,
        progress: data.progress,
        dueDate: data.due_date,
        status: data.status,
        priority: data.priority,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
}

/**
 * Helper object containing core database operations for Projects.
 * Handles insertion, retrieval, updates, and deletion.
 */
export const projectHelper = {

    /**
     * Creates a new project in the database.
     * 
     * @param supabase - The Supabase client instance.
     * @param projectData - The project data to insert (excluding generated fields).
     * @returns A promise resolving to the created project on success.
     */
    async createProject(supabase: SupabaseClient, projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
        try {

            // maps out the details before inserting in the database
            const dbRecord = {
                name: sanitizeInput(projectData.title),
                description: projectData.description ? sanitizeInput(projectData.description) : undefined,
                client_name: projectData.client,
                workspace_id: projectData.workspaceId,
                owner_id: projectData.owner,
                progress: projectData.progress,
                due_date: projectData.dueDate,
                status: projectData.status,
                priority: projectData.priority,
            }

            const {data, error} = await supabase.from("projects")
                .insert(dbRecord)
                .select()
                .single();
            
            if(error)
                throw error;

            return {
                success: true,
                data: mapProjects(data)
            }
        } catch (error: unknown) {
            console.error("Failed to create project", error)

            const message = error instanceof Error ? error.message: String(error);
            return {success: false, error: message || "Unknown error occured"}
        }
    },

    /**
     * Retrieves projects from the database, optionally filtered by user ID.
     * 
     * @param supabase - The Supabase client instance.
     * @param userId - Optional user ID to filter by owner.
     * @returns A promise resolving to an array of projects on success.
     */
    async getProjects(supabase: SupabaseClient, userId?: string) {
        try {
            let query = supabase.from("projects").select("*").order("created_at", {
                ascending: false
            });

            if(userId)
                query = query.eq("owner_id", userId);

            const {data, error} = await query;

            if(error)
                throw error;

            return{
                success: true,
                data: data.map(mapProjects)
            }
        } catch (error: unknown) {
            console.error("Failed to retrieve projects", error)

            const message = error instanceof Error ? error.message: String(error);
            return {success: false, error: message || "Unknown error occured"}
        }
    },

    /**
     * Updates an existing project in the database.
     * 
     * @param supabase - The Supabase client instance.
     * @param id - The ID of the project to update.
     * @param projectData - Partial project data to apply.
     * @returns A promise resolving to the updated project on success.
     */
    async updateProject(supabase: SupabaseClient, id: string, projectData: Partial<Project>) {
        try {
            const dbData: any = {...projectData}
            
            if (dbData.title) {
                dbData.name = sanitizeInput(dbData.title);
                delete dbData.title;
            }

            if (dbData.client) {
                dbData.client_name = dbData.client;
                delete dbData.client;
            }

            if (dbData.workspaceId) {
                dbData.workspace_id = dbData.workspaceId;
                delete dbData.workspaceId;
            }

            if (dbData.owner) {
                dbData.owner_id = dbData.owner;
                delete dbData.owner;
            }

            if (dbData.dueDate) {
                dbData.due_date = dbData.dueDate;
                delete dbData.dueDate;
            }

            const {data, error} = await supabase.from("projects")
                .update(dbData)
                .eq("id", id)
                .select()
                .single();

            if(error)
                throw error;

            return {
                success: true,
                data: mapProjects(data)
            }
        } catch (error: unknown) {
            console.error("Failed to update project", error)

            const message = error instanceof Error ? error.message: String(error);
            return {success: false, error: message || "Unknown error occured"}
        }
    },

    /**
     * Deletes a project from the projects table.
     * 
     * @param supabase - The Supabase client instance.
     * @param projectId - The ID of the project to delete.
     * @returns A promise resolving to a success flag and message/error.
     */
    async deleteProject(supabase: SupabaseClient, projectId: string) {
        try {
            const {error} = await supabase.from("projects")
                .delete()
                .eq("id", projectId);

            if(error)
                throw error;

            return {
                success: true,
                message: "Project deleted successfully"
            }
        } catch (error) {
            console.error("Failed to delete project", error)

            const message = error instanceof Error ? error.message: String(error);
            return {success: false, error: message || "Unknown error occured"}
        }
    }
}