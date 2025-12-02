import { SupabaseClient } from "@supabase/supabase-js";

export interface Task {
    id: string
    task_name: string
    created: string
    updated: string
}

export const taskHelper = {
    async createTask(supabase: SupabaseClient) {

    },

    async updateTask(supabase: SupabaseClient) {

    },

    async deleteTask(supabase: SupabaseClient) {
        
    }
}