"use client";

import StatsCard from "./stats-card";
import ProjectRow from "./project-row";
import RecentActivity from "./recent-activity";

import { Button } from "@/components/ui/button";
import { FolderOpen, Clock, CheckCircle, Users, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty";

export default function Dashboard() {

    const {loading, projects, error} = useProjects()

    const capitalizeStatus = (status: string) => {
        if(!status) return "Active"
        const mapped: Record<string, "Active" | "Review" | "Completed" | "Delayed"> = {
            active: "Active",
            review: "Review",
            completed: "Completed",
            delayed: "Delayed"
        }

        return mapped[status.toLowerCase()] || "Active"
    }

    const formatDate = (dateStr?: string) => {
        if(!dateStr) return "No due date"
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            })
        } catch  {
            return dateStr
        }
    }

    if(loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse text-xs font-medium">Loading dashboard data...</p>
            </div>
        )
    }

    if(error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-rose-500 font-semibold text-xs">Error loading projects: {error}</p>
            </div>
        )
    }

    const activeProjectsCount = projects.filter(p => p.status?.toLowerCase() === "active").length
    const completedProjectsCount = projects.filter(p => p.status?.toLowerCase() === "completed").length
    // to change here and dapat yung subtasks under nung icocount dito
    const pendingProjectsCount = projects.filter(p => p.status?.toLowerCase() === "review" || p.status?.toLowerCase() === "delayed" || p.status?.toLowerCase() === "active").length

    const statsCardData = [
        {
            title: "Active Projects",
            value: String(activeProjectsCount), // Dynamic count from database
            change: "Live in workspace",
            changeType: "positive" as const,
            Icon: FolderOpen
        },
        {
            title: "Pending Tasks",
            value: String(pendingProjectsCount), // Placeholder for task integration
            change: "+5 from yesterday",
            changeType: "neutral" as const,
            Icon: Clock
        },
        {
            title: "Team Members",
            value: "3", // Dynamic count from your 3 seeded users
            change: "Active partners",
            changeType: "positive" as const,
            Icon: Users
        },
        {
            title: "Completed",
            value: String(completedProjectsCount), // Dynamic count from database
            change: "Archive plates",
            changeType: "positive" as const,
            Icon: CheckCircle
        }
    ];

    return (
        <div className="flex-1 space-y-6 pt-8 pb-12">
            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statsCardData.map((data) => (
                    <StatsCard
                        key={data.title}
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
                {/* Projects List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-xl tracking-tight">Active Projects</h2>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{projects.length} projects</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="cursor-pointer border-border/40 hover:border-primary/40 transition-all font-semibold glass-morphism !bg-transparent h-8 text-xs">
                                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                                Filter
                            </Button>
                            <Button variant="outline" size="sm" className="cursor-pointer border-border/40 hover:border-primary/40 transition-all font-semibold glass-morphism !bg-transparent h-8 text-xs">
                                View All
                                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                        </div>
                    </div>
                    {/* Column headers */}
                    <div className="hidden lg:flex items-center gap-5 px-5 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <div className="w-2 shrink-0" />
                        <div className="flex-1">Project</div>
                        <div className="w-14 shrink-0">Status</div>
                        <div className="w-14 shrink-0">Priority</div>
                        <div className="w-36 shrink-0">Progress</div>
                        <div className="w-24 shrink-0">Due Date</div>
                        <div className="w-8 shrink-0">Team</div>
                        <div className="w-4 shrink-0" />
                    </div>
                    {/* 5. Render dynamic project rows or show an empty state placeholder */}
                    {projects.length === 0 ? (
                        <Empty className="border border-dashed border-border/60 bg-background/5 rounded-xl py-12">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <FolderOpen className="text-muted-foreground w-5 h-5" />
                                </EmptyMedia>
                                <EmptyTitle className="text-sm font-bold mt-2">No Active Projects</EmptyTitle>
                                <EmptyDescription className="text-xs text-muted-foreground/80 max-w-xs">
                                    Go to the Projects tab to create your first project and begin tracking sheets.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="space-y-2">
                            {projects.slice(0, 4).map((item) => (
                                <ProjectRow
                                    key={item.id}
                                    id={item.id}
                                    projectTitle={item.title}
                                    clientName={item.client || "No client"}
                                    progress={item.progress || 0}
                                    dueDate={item.dueDate ? formatDate(item.dueDate) : "No due date"}
                                    teamMembers={3}
                                    status={capitalizeStatus(item.status)}
                                    priority={item.priority?.toLowerCase() as "high" | "medium" | "low" || "medium"}
                                />
                            ))}
                        </div>
                    )}
                </div>
                {/* Right Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Weekly Pulse */}
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
                                <span className="text-sm font-bold font-jetbrains-mono text-emerald-500">5 tasks</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-amber-500/5 transition-all group/row">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                    <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Due Today</span>
                                </div>
                                <span className="text-sm font-bold font-jetbrains-mono text-amber-500">3 tasks</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-sky-500/5 transition-all group/row">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                                    <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Meetings</span>
                                </div>
                                <span className="text-sm font-bold font-jetbrains-mono text-sky-500">3 scheduled</span>
                            </div>
                            <div className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-rose-500/5 transition-all group/row">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                    <span className="text-sm font-medium text-muted-foreground group-hover/row:text-foreground transition-colors">Overdue</span>
                                </div>
                                <span className="text-sm font-bold font-jetbrains-mono text-rose-500">2 tasks</span>
                            </div>
                        </div>
                    </div>
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
