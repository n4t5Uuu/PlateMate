"use client";

import StatsCard from "./stats-card";
import RecentActivity from "./recent-activity";
import WeeklyPulse from "./weekly-pulse";
import ProjectsList from "./projects-list";

import { FolderOpen, Clock, CheckCircle } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";

export default function Dashboard() {
    const { loading, projects, error, updateProject, deleteProject } = useProjects()

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse text-xs font-medium">Loading dashboard data...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-rose-500 font-semibold text-xs">Error loading projects: {error}</p>
            </div>
        )
    }

    // Counts the projects based on status and will be displayed on the status cards
    const activeProjectsCount = projects.filter(p => p.status?.toLowerCase() === "active").length
    const completedProjectsCount = projects.filter(p => p.status?.toLowerCase() === "completed").length
    
    // to edit once subtasks has been implemented on the project
    const pendingProjectsCount = projects.filter(p => p.status?.toLowerCase() === "review" || p.status?.toLowerCase() === "delayed" || p.status?.toLowerCase() === "active").length

    const statsCardData = [
        {
            title: "Active Projects",
            value: String(activeProjectsCount),
            change: "Live in workspace",
            changeType: "positive" as const,
            Icon: FolderOpen
        },
        {
            title: "Pending Tasks",
            value: String(pendingProjectsCount),
            change: "+5 from yesterday",
            changeType: "neutral" as const,
            Icon: Clock
        },
        {
            title: "Completed",
            value: String(completedProjectsCount),
            change: "Ready for review",
            changeType: "positive" as const,
            Icon: CheckCircle
        }
    ]

    return (
        <div className="flex-1 space-y-6 pt-6 pb-12 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground">Welcome back, Alden!</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Here is what is happening with your projects this week.</p>
            </div>

            {/* Stats Cards Row */}
            <div className="grid gap-4 md:grid-cols-3">
                {statsCardData.map((data, index) => (
                    <StatsCard 
                        key={index}
                        title={data.title}
                        value={data.value}
                        change={data.change}
                        changeType={data.changeType}
                        Icon={data.Icon}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Projects List Component */}
                <ProjectsList 
                    projects={projects}
                    loading={loading}
                    error={error}
                    updateProject={updateProject}
                    deleteProject={deleteProject}
                />

                {/* Right Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Weekly Pulse */}
                    <WeeklyPulse />

                    {/* Recent Activity */}
                    <div className="glass-morphism rounded-xl border-none shadow-lg px-5 sm:px-6 pt-5 pb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/70 mb-5">Recent Activity</p>
                        <RecentActivity layout="list" />
                    </div>
                </div>
            </div>
        </div>
    )
}
