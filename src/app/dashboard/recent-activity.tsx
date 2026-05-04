import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sampleActivities = [
    {
        id: 1,
        name: "John Doe",
        action: "Completed a task",
        project: "Avenues",
        time: "2h ago",
        avatar: "JD"
    },
    {
        id: 2,
        name: "Jane Smith",
        action: "Commented on a task",
        project: "Downtown Office Complex",
        time: "3h ago",
        avatar: "JS"
    },
    {
        id: 3,
        name: "Alice Johnson",
        action: "Created a new task",
        project: "The Line",
        time: "5h ago",
        avatar: "AJ"
    },
    {
        id: 4,
        name: "Bob Brown",
        action: "Updated task status",
        project: "Riyadh Park",
        time: "1d ago",
        avatar: "BB"
    }
]

interface RecentActivityProps {
    layout?: "list" | "grid" | "strip"
}

export default function RecentActivity({ layout = "list" }: RecentActivityProps) {
    if (layout === "strip") {
        return (
            <div className="flex items-center gap-2">
                {sampleActivities.map((activity) => (
                    <div
                        key={activity.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-background/40 hover:border-primary/40 hover:bg-primary/5 transition-all group cursor-pointer shrink-0"
                    >
                        <Avatar className="w-6 h-6 shrink-0 border border-primary/20 group-hover:border-primary/50 transition-all">
                            <AvatarImage />
                            <AvatarFallback className="text-[9px] font-bold bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">{activity.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <span className="text-xs font-semibold group-hover:text-primary transition-colors">{activity.name}</span>
                            <span className="text-xs text-muted-foreground"> · {activity.action}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 shrink-0 pl-1">{activity.time}</span>
                    </div>
                ))}
            </div>
        )
    }

    if (layout === "grid") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {sampleActivities.map((activity) => (
                    <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-primary/5 transition-all group cursor-pointer" key={activity.id}>
                        <Avatar className="w-9 h-9 shrink-0 border-2 border-primary/30 ring-2 ring-primary/10 group-hover:border-primary/60 group-hover:ring-primary/20 transition-all">
                            <AvatarImage />
                            <AvatarFallback className="text-[11px] font-bold bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">{activity.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.name}</p>
                                <span className="text-[10px] text-muted-foreground shrink-0">{activity.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{activity.action}</p>
                            <p className="text-[11px] text-foreground/60 font-medium truncate">{activity.project}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="relative space-y-4 before:absolute before:top-[20px] before:bottom-[20px] before:left-[18px] before:w-px before:bg-border">
            {sampleActivities.map((activity) => (
                <div className="relative flex items-start gap-3 group cursor-pointer" key={activity.id}>
                    <Avatar className="w-9 h-9 shrink-0 mt-0.5 z-10 group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                        <AvatarImage />
                        <AvatarFallback className="text-[11px] font-bold bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate leading-snug">
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{activity.name}</span>
                            {" "}{activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{activity.project} · {activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
