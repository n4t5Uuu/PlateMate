import { SupabaseClient } from "@supabase/supabase-js";

export interface Project {
    id: string;
    title: string;
    description?: string;
    client: string
    progress: number
    dueDate: string;
    status: "active" | "review" | "completed" | "delayed";
    priority: "low" | "medium" | "high";
    teamMembers?: string[]; //array of user ids
    owner: string; //user id
    created_at: string;
    updated_at: string;
}

// to map the data of the project
function mapProjects(data: any): Project {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        client: data.client,
        progress: data.progress,
        dueDate: data.due_date,
        status: data.status,
        priority: data.priority,
        teamMembers: data.team_members,
        owner: data.owner,
        created_at: data.created_at,
        updated_at: data.updated_at
    };
}

export const projectHelper = {

    // creates a new project and adds it to the projects table
    async createProject(supabase: SupabaseClient, projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
        try {

            const dbRecord = {
                title: projectData.title,
                description: projectData.description,
                client: projectData.client,
                progress: projectData.progress,
                due_date: projectData.dueDate,
                status: projectData.status,
                priority: projectData.priority,
                team_members: projectData.teamMembers,
                owner: projectData.owner
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

    // gets the exisiting projects
    async getProjects(supabase: SupabaseClient, userId?: string) {
        try {
            let query = supabase.from("projects").select("*").order("created_at", {
                ascending: false
            });

            if(userId)
                query = query.eq("owner", userId);

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

    // updates the details of the existing project
    async updateProject(supabase: SupabaseClient, id: string, projectData: Partial<Project>) {
        try {
            const dbData: any = {...projectData}
            if(projectData.dueDate)
                dbData.due_date = projectData.dueDate;

            if(projectData.teamMembers)
                dbData.team_members = projectData.teamMembers;
            
            // Remove camelCase keys that were mapped to snake_case
            delete dbData.dueDate;
            delete dbData.teamMembers;

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

    // deletes a project from the projects table
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