import StatsCard from "./stats-card";
import ProjectCard from "./project-card";
import RecentActivity from "./recent-activity";

import {Button} from "@/components/ui/button";
import {FolderOpen, Clock, CheckCircle, Users, Funnel} from "lucide-react";

export const metadata = {
    title: "Dashboard",
    description: "PlateMate Dashboard - Manage and Track Your Projects"
}

const sampleProjects = [
    {
        projectName: "Downtom Office Complex",
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
        <div className="flex-1 space-y-8 pt-8 pb-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="font-bold text-2xl tracking-tight">Active Projects</h2>
                            <p className="text-muted-foreground text-xs font-medium opacity-70">Manage your ongoing architectural designs</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" className="cursor-pointer border-border/50 hover:border-primary/50 transition-all font-semibold glass-morphism !bg-transparent h-10">
                                <Funnel className="w-4 h-4 mr-2"/>
                                Filter
                            </Button>
                            <Button variant="outline" className="cursor-pointer border-border/50 hover:border-primary/50 transition-all font-semibold glass-morphism !bg-transparent h-10">
                                View All
                            </Button>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-6 ">
                        {sampleProjects.map((items) => (
                            <ProjectCard 
                                key={items.projectName} 
                                projectTitle={items.projectName}
                                clientName={items.client}
                                progress={items.progress}
                                dueDate={items.dueDate}
                                teamMembers={items.teamMembers}
                                status={items.status}
                                priority={items.priority}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <RecentActivity />

                    <div className="glass-morphism rounded-xl p-6 border-none shadow-lg space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Project Pulse</h3>
                            <p className="text-lg font-bold tracking-tight">Weekly Overview</p>
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all">
                                <div className="space-y-1">
                                    <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Completed</p>
                                    <p className="text-sm font-bold opacity-70">5 Tasks</p>
                                </div>
                                <span className="text-3xl font-jetbrains-mono font-bold text-emerald-500">5</span>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 group hover:bg-amber-500/10 transition-all">
                                <div className="space-y-1">
                                    <p className="text-amber-500 text-[10px] font-bold uppercase tracking-widest">Due Today</p>
                                    <p className="text-sm font-bold opacity-70">3 Tasks</p>
                                </div>
                                <span className="text-3xl font-jetbrains-mono font-bold text-amber-500">3</span>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-sky-500/5 border border-sky-500/10 group hover:bg-sky-500/10 transition-all">
                                <div className="space-y-1">
                                    <p className="text-sky-500 text-[10px] font-bold uppercase tracking-widest">Meetings</p>
                                    <p className="text-sm font-bold opacity-70">3 Scheduled</p>
                                </div>
                                <span className="text-3xl font-jetbrains-mono font-bold text-sky-500">3</span>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 group hover:bg-rose-500/10 transition-all">
                                <div className="space-y-1">
                                    <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">Overdue</p>
                                    <p className="text-sm font-bold opacity-70">2 Tasks</p>
                                </div>
                                <span className="text-3xl font-jetbrains-mono font-bold text-rose-500">2</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}