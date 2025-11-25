import {supabase} from "@/lib/supabase";

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

function mapProjects(data): Project {
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

    async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
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

    async getProjects(userId?: string) {
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

    async updateProject(id: string, projectData: Partial<Project>) {
        try {
            const dbData = {...projectData}
            if(projectData.dueDate)
                dbData.dueDate = projectData.dueDate;

            if(projectData.teamMembers)
                dbData.teamMembers = projectData.teamMembers;

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

    async deleteProject(projectId: string) {
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