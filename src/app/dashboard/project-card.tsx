import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Users } from "lucide-react";

interface ProjectCardProps {
    projectTitle: string
    clientName: string
    progress: number
    dueDate: string
    status: "Active" | "Review" | "Completed" | "Delayed"
    teamMembers?: number
    priority: "high" | "medium" | "low"
}

export default function ProjectCard({ projectTitle, clientName, progress, dueDate, status,
    teamMembers, priority }: ProjectCardProps) {

    const priorityColors = {
        high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    }

    const statusBarColors = {
        Active: "bg-blue-500",
        Review: "bg-violet-500",
        Completed: "bg-emerald-500",
        Delayed: "bg-rose-500"
    }

    const statusBadgeColors = {
        Active: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Review: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        Delayed: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    }

    return (
        <Card className="glass-morphism group hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden border-none shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                        <CardTitle className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors truncate">{projectTitle}</CardTitle>
                        <p className="text-muted-foreground text-xs font-medium opacity-60">{clientName}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge className={`${statusBadgeColors[status]} text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest border shadow-none`} variant="outline">
                            {status}
                        </Badge>
                        <Badge className={`${priorityColors[priority]} text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest border shadow-none`} variant="outline">
                            {priority}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-5">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Progress</p>
                            <p className="font-jetbrains-mono text-sm font-bold text-foreground">{progress}%</p>
                        </div>
                        <div className="relative h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div
                                className={`absolute inset-y-0 left-0 ${statusBarColors[status]} transition-all duration-1000 ease-out`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground/60">
                        <div className="flex items-center gap-1.5">
                            <Clipboard className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">{dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-semibold">{teamMembers} Members</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
