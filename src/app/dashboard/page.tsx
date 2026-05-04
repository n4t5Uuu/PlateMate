import StatsCard from "./stats-card";
import ProjectRow from "./project-row";
import RecentActivity from "./recent-activity";

import { Button } from "@/components/ui/button";
import { FolderOpen, Clock, CheckCircle, Users, SlidersHorizontal, ArrowRight } from "lucide-react";

export const metadata = {
    title: "Dashboard",
    description: "PlateMate Dashboard - Manage and Track Your Projects"
}

const sampleProjects = [
    {
        projectName: "Downtown Office Complex",
        client: "Wyvern Corp",
        progress: 75,
        dueDate: "Dec 15, 2026",
        status: "Active" as const,
        teamMembers: 8,
        priority: "high" as const
    },
    {
        projectName: "Al Qasr Mall",
        client: "Alden Olmedo",
        progress: 55,
        dueDate: "Dec 30, 2030",
        status: "Delayed" as const,
        teamMembers: 6,
        priority: "medium" as const
    },
    {
        projectName: "Avenues",
        client: "Alexa Yadao",
        progress: 100,
        dueDate: "Nov 31, 2030",
        status: "Completed" as const,
        teamMembers: 6,
        priority: "low" as const
    },
    {
        projectName: "The Line",
        client: "King Salman",
        progress: 90,
        dueDate: "Dec 30, 2030",
        status: "Review" as const,
        teamMembers: 20,
        priority: "high" as const
    }
];

const statsCardData = [
    {
        title: "Active Projects",
        value: "12",
        change: "+2 from last month",
        changeType: "positive" as const,
        Icon: FolderOpen
    },
    {
        title: "Pending Tasks",
        value: "24",
        change: "+5 from yesterday",
        changeType: "neutral" as const,
        Icon: Clock
    },
    {
        title: "Team Members",
        value: "18",
        change: "+3 new this week",
        changeType: "positive" as const,
        Icon: Users
    },
    {
        title: "Completed",
        value: "8",
        change: "+2 this week",
        changeType: "positive" as const,
        Icon: CheckCircle
    }
]

export default function Dashboard() {
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
                            <p className="text-[11px] text-muted-foreground mt-0.5">{sampleProjects.length} projects</p>
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

                    <div className="space-y-2">
                        {sampleProjects.map((item) => (
                            <ProjectRow
                                key={item.projectName}
                                projectTitle={item.projectName}
                                clientName={item.client}
                                progress={item.progress}
                                dueDate={item.dueDate}
                                teamMembers={item.teamMembers}
                                status={item.status}
                                priority={item.priority}
                            />
                        ))}
                    </div>
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
