import { Badge } from "@/components/ui/badge";
import { Clipboard, Users, ChevronRight } from "lucide-react";
import Link from "next/link"

interface ProjectRowProps {
    id: string
    projectTitle: string
    clientName: string
    progress: number
    dueDate: string
    status: "Active" | "Review" | "Completed" | "Delayed"
    teamMembers?: number
    priority: "high" | "medium" | "low"
}

export default function ProjectRow({ id, projectTitle, clientName, progress, dueDate, status, teamMembers, priority }: ProjectRowProps) {
    const priorityColors = {
        high: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    }

    const statusColors = {
        Active: "bg-blue-500",
        Review: "bg-violet-500",
        Completed: "bg-emerald-500",
        Delayed: "bg-rose-500"
    }

    const statusTextColors = {
        Active: "text-blue-500",
        Review: "text-violet-500",
        Completed: "text-emerald-500",
        Delayed: "text-rose-500"
    }

    return (
        <Link 
            className="flex items-center gap-3 sm:gap-5 px-3 sm:px-5 py-3 sm:py-4 rounded-xl border border-border bg-background/10 hover:bg-primary/5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer group"
            href={`/projects/${id}`}
        >
            <div className={`w-2 h-2 rounded-full shrink-0 ${statusColors[status]}`} />

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{projectTitle}</p>
                <p className="text-[11px] text-muted-foreground truncate">{clientName}</p>
            </div>

            <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-widest shrink-0 ${statusTextColors[status]}`}>
                {status}
            </span>

            <Badge className={`${priorityColors[priority]} text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest border shadow-none shrink-0`} variant="outline">
                {priority}
            </Badge>

            <div className="hidden md:flex items-center gap-2 w-36 shrink-0">
                <div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden">
                    <div className={`h-full ${statusColors[status]} transition-all duration-1000`} style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[11px] font-jetbrains-mono font-bold text-muted-foreground w-8 text-right">{progress}%</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground shrink-0">
                <Clipboard className="w-3 h-3" />
                <span className="text-[11px] font-medium">{dueDate}</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground shrink-0">
                <Users className="w-3 h-3" />
                <span className="text-[11px] font-medium">{teamMembers}</span>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
        </Link>
    )
}
