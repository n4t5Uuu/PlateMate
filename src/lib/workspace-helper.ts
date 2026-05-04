import {SupabaseClient} from "@supabase/supabase-js";
import {sanitizeInput} from "./security";
import {Workspace} from "@/types/workspace.types";

function mapWorkspace(data: any): Workspace {
    return {
        id: data.id,
        name: data.name,
        created_at: data.created_at
    }
}

function extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "object" && error !== null && "message" in error) return String((error as any).message)
    return "An unexpected error occurred"
}

export const workspaceHelper = {
    async getWorkspaces(supabase: SupabaseClient, userId: string) {
        try {
            const {data, error} = await supabase.from("tbl_workspace_members")
                .select("workspace_id, tbl_workspaces(id, name, created_at)")
                .eq("user_id", userId);

            if (error) throw error

            return {
                success: true,
                data: data.map((row: any) => mapWorkspace(row.tbl_workspaces))
            }
        } catch (error) {
            console.error("[getWorkspaces]", error)
            return {
                success: false,
                error: extractMessage(error)
            }
        }
    },

    async createWorkspace(supabase: SupabaseClient, userId: string, workspaceName: string) {
        try {
            const {data, error} = await supabase.from("tbl_workspaces")
                .insert({name: sanitizeInput(workspaceName)})
                .select()
                .single()

            if (error) throw error

            const {error: memberError} = await supabase.from("tbl_workspace_members")
                .insert({ user_id: userId, workspace_id: data.id, role: "owner" })

            if (memberError) throw memberError

            return {
                success: true,
                data: mapWorkspace(data)
            }
        } catch (error) {
            console.error("[createWorkspace]", error)
            return { success: false, error: extractMessage(error) }
        }
    }
}