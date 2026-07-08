"use client"

import { useState, useEffect } from "react";
import { workspaceHelper } from "@/lib/workspace-helper";
import { Workspace } from "@/types/workspace.types";
import { browserSupabase } from "@/lib/supabase/browser";
import { useAuth } from "@/components/providers/auth-provider";

export function useWorkspaces() {
    // Destructure auth loading state to coordinate page mount checks
    const {user, loading: authLoading} = useAuth()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    // Tracks database loading state locally during workspace fetches/mutations
    const [dbLoading, setDbLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchWorkspaces = async () => {
        // checks if the user id is valid, else if it would return an empty list of workspaces
        if (!user?.id) {
            setWorkspaces([])
            return
        }

        setDbLoading(true)
        setError(null)

        const result = await workspaceHelper.getWorkspaces(browserSupabase, user.id)

        if (result.success) 
            setWorkspaces(result.data as Workspace[])
        else 
            setError(result.error || "Failed to fetch workspaces")

        setDbLoading(false)
    }

    useEffect(() => {
        fetchWorkspaces()
    }, [user?.id])

    const createWorkspace = async (workspaceName: string) => {
        if(!user?.id) {
            return {
                success: false,
                error: "Not logged in"
            }
        }

        const result = await workspaceHelper.createWorkspace(browserSupabase, user.id, workspaceName)

        if (result.success)
            await fetchWorkspaces() // refresh workspaces after creating a new one

        return result
    }

    return {
        workspaces,
        // Combined loading state to prevent double-flicker on workspace navigation/initial load
        loading: authLoading || dbLoading, 
        error,
        createWorkspace,
        refetchWorkspaces: fetchWorkspaces
    }
}