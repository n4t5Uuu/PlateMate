import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Progress} from "@/components/ui/progress";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"; 

import {LucideIcon, Clipboard, Users} from "lucide-react";

interface ProjectCardProps {
    projectTitle: string
    clientName: string
    progress: number
    dueDate: string
    status: "Active" | "Review" | "Completed" | "Delayed"
    teamMembers?: number
    priority: "high" | "medium" | "low"
}

export default function ProjectCard({projectTitle, clientName, progress, dueDate, status, 
    teamMembers, priority}: ProjectCardProps) {
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

    return (
        <Card className="glass-morphism group hover:border-primary/40 transition-all duration-500 cursor-pointer overflow-hidden border-none shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">{projectTitle}</CardTitle>
                        <p className="text-muted-foreground text-xs font-medium opacity-60">
                            {clientName}
                        </p>
                    </div>
                    <Badge className={`${priorityColors[priority]} text-[10px] py-0.5 px-2 font-bold uppercase tracking-widest border shadow-none`} variant="outline">
                        {priority}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">Progress</p>
                            <p className="font-jetbrains-mono text-sm font-bold text-foreground">{progress}%</p>
                        </div>
                        <div className="relative h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                            <div 
                                className={`absolute inset-y-0 left-0 ${statusColors[status]} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/30">
                            <Clipboard className="w-3.5 h-3.5 text-muted-foreground/60"/>
                            <p className="text-[11px] font-semibold truncate">{dueDate}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/30">
                            <Users className="w-3.5 h-3.5 text-muted-foreground/60"/>
                            <p className="text-[11px] font-semibold truncate">{teamMembers} Members</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse shadow-[0_0_8px_var(--primary)]`} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/70">{status}</span>
                        </div>
                        <div className="flex -space-x-2 isolate">
                            {[1,2,3].map((i) => (
                                <Avatar key={i} className="w-7 h-7 border-2 border-background ring-1 ring-border shadow-sm">
                                    <AvatarFallback className="text-[9px] font-bold bg-muted">U{i}</AvatarFallback> 
                                </Avatar>
                            ))}
                            <div className="w-7 h-7 rounded-full bg-primary/10 border-2 border-background ring-1 ring-border flex items-center justify-center text-[9px] font-bold text-primary">
                                +{teamMembers ? teamMembers - 3 : 0}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}