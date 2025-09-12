import pb from '@/lib/pb';
import getErrorMessage from './error-message';

export interface Project {
    id: string;
    name: string;
    description?: string;
    progress: number
    dueDate: string;
    status: "active" | "review" | "completed" | "delayed";
    priority: "low" | "medium" | "high";
    teamMembers: string[]; //array of user ids
    owner: string; //user id
    created: string;
    updated: string;
}

export interface Activity {
    id: string;
    user: string; //user id
    action: string;
    project?: string; //project id
    timestamp: string;
    details?: string;
    created: string;
    updated: string;
}

const dataHelper = {

    async createProject(projectData: Omit<Project, 'id' | 'created' | 'updated'>) {
        try {
            const record = await pb.collection("projects").create(projectData);
            return {success: true, project: record};
        } catch (error: unknown) {
            return {success: false, error: getErrorMessage(error)}
        }
    },

    async getProjects(userId?: string) {
        try {
            const filter = userId ? `owner="${userId}"` : "";
            const records = await pb.collection("projects").getFullList<Project>({
                filter,
                expand: "teamMembers.owner",
                sort: "-created"
            });
            return {success: true, projects: records};
        } catch (error: unknown) {
            return {success: false, error: getErrorMessage(error)};
        }
    },

    async updateProject(id: string, projectData: Partial<Project>) {
        try {
            const record = await pb.collection("projects").update(id, projectData);
            return {success: true, data: record}
        } catch (error: unknown) {
            return {success: false, error: getErrorMessage(error)};
        }
    },

    async getActivities(limit = 10) {
        try {
            const records = await pb.collection("activities").getList<Activity>(1, limit, {
                expand: "user.project",
                sort: "-created"
            })

            return {success: true, activities: records}
        } catch (error: unknown) {
            return {success: false, error: getErrorMessage(error)}
        }
    },

    async createActivity(activityData: Omit<Activity, "id" | "created" | "updated">) {
        try {
            const record = await pb.collection("activities").create(activityData); 
            return {success: true, data: record}
        } catch (error: unknown) {
            return {success: false, error: getErrorMessage(error)}
        }
    },

    async getDashboardStats(userId: string) {
        try {
            const [projectResult, activitiesResult] = await Promise.all([
                pb.collection("projects").getFullList({
                    filter: `owner = "${userId}"`
                }),
                pb.collection("activities").getFullList({
                    filter: `user = "${userId}"`,
                    sort: "-created"
                })
            ])

            const projects = projectResult;
            const activities = activitiesResult;
            
            const stats = {
                activeProjects: projects.filter((p) => p.status === "active").length,
                totalProjects: projects.length,
                completedProjects: projects.filter((p) => p.status === "completed").length,
                pendingTasks: projects.filter((p) => p.status === "pending").length,
                recentActivities: activities.slice(0, 5)
            }

            return {success: true, data: stats}
        } catch (error: unknown) {
            return {success: false, error: getErrorMessage(error)}
        }
    }
}