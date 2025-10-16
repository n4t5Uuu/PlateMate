import pb from "@/lib/pb";
import getErrorMessage from './error-message';

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

export const activityHelper = {
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
    }
}