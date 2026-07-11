"use client"

import { useState, useEffect } from "react"
import { browserSupabase } from "@/lib/supabase/browser"

export default function WeeklyPulse() {
    // Weekly Pulse stats state
    const [weeklyPulse, setWeeklyPulse] = useState({
        completed: 0,
        dueToday: 0,
        meetings: 0,
        overdue: 0
    })

    // fetch the Weekly Pulse data from the database
    useEffect(() => {
        async function fetchWeeklyPulse() {
            try {
                // Get the authenticated user
                const {data: {user}} = await browserSupabase.auth.getUser()
                if(!user) return

                // Get the workspace ID where the user is a member
                const {data: workspaceMembers} = await browserSupabase.from("tbl_workspace_members")
                                                                    .select("workspace_id")
                                                                    .eq("user_id", user.id)
                const workspaceIds = workspaceMembers?.map(m => m.workspace_id) || []
                if(workspaceIds.length === 0) return

                // Fetch project IDs inside the workspaces
                const {data: dbProjects} = await browserSupabase.from("tbl_projects")
                                                                .select("id")
                                                                .in("workspace_id", workspaceIds)
                const projectIds = dbProjects?.map(p => p.id) || []
                if(projectIds.length === 0) return

                // Query completed tasks whether its status is done or completed
                const {count: completedCount} = await browserSupabase.from("tbl_tasks")
                                                                    .select("*", {count: "exact", head: true})
                                                                    .in("project_id", projectIds)
                                                                    .in("status", ["done", "completed"])
                const today = new Date().toISOString().split("T")[0]
                const {count: dueTodayCount} = await browserSupabase.from("tbl_tasks")
                                                                    .select("*", {count: "exact", head: true})
                                                                    .in("project_id", projectIds)
                                                                    .eq("due_date", today)
                                                                    .not("status", "in", '("done","completed")')
                
                // Query the overdue tasks that is past the due date and status is not done/completed
                const { count: overdueCount } = await browserSupabase.from("tbl_tasks")
                                                                    .select("*", { count: "exact", head: true })
                                                                    .in("project_id", projectIds)
                                                                    .lt("due_date", today)
                                                                    .not("status", "in", '("done","completed")')

                // Query the crit sessions (meetings) that is scheduled this week
                const now = new Date()
                const day = now.getDay()
                const diff = now.getDate() - day + (day === 0 ? -6 : 1)
                const startOfWeek = new Date(now.setDate(diff))
                startOfWeek.setHours(0,0,0,0)

                const endOfWeek = new Date(startOfWeek)
                endOfWeek.setDate(endOfWeek.getDate() + 6)
                endOfWeek.setHours(23, 59, 59, 999)

                const {count: meetingsCount} = await browserSupabase.from("tbl_crit_sessions")
                                                                    .select("*", {count: "exact", head: true})
                                                                    .in("project_id", projectIds)
                                                                    .gte("started_at", startOfWeek.toISOString())
                                                                    .lte("started_at", endOfWeek.toISOString())
                setWeeklyPulse({
                    completed: completedCount || 0,
                    dueToday: dueTodayCount || 0,
                    meetings: meetingsCount || 0,
                    overdue: overdueCount || 0
                })
            } catch (error) {
                console.error("Error loading Weekly Pulse:", error)
            }
        }

        fetchWeeklyPulse()
    }, [])

    return (
        <div className="glass-morphism rounded-xl border-none shadow-lg flex flex-col">
            <div className="px-5 sm:px-6 pt-6 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70">Weekly Pulse</h3>
            </div>
            <div className="px-4 sm:px-5 pb-5 space-y-1">
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-emerald-500/5 transition-all group/row">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Completed</span>
                    </div>
                    <span className="text-sm font-bold font-jetbrains-mono text-emerald-500">{weeklyPulse.completed} tasks</span>
                </div>
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-amber-500/5 transition-all group/row">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Due Today</span>
                    </div>
                    <span className="text-sm font-bold font-jetbrains-mono text-amber-500">{weeklyPulse.dueToday} tasks</span>
                </div>
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-sky-500/5 transition-all group/row">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Meetings</span>
                    </div>
                    <span className="text-sm font-bold font-jetbrains-mono text-sky-500">{weeklyPulse.meetings} scheduled</span>
                </div>
                <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-rose-500/5 transition-all group/row">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Overdue</span>
                    </div>
                    <span className="text-sm font-bold font-jetbrains-mono text-rose-500">{weeklyPulse.overdue} tasks</span>
                </div>
            </div>
        </div>
    )
}
