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

export default function RecentActivity() {
    return (
        <div className="relative space-y-5 before:absolute before:top-4 before:bottom-4 before:left-[17px] before:w-px before:bg-border">
            {sampleActivities.map((activity) => (
                <div className="relative flex items-center gap-4 group" key={activity.id}>
                    <Avatar className="w-9 h-9 shrink-0 z-10 border-2 border-primary/30 ring-2 ring-primary/10 group-hover:border-primary/60 group-hover:ring-primary/20 transition-all">
                        <AvatarImage />
                        <AvatarFallback className="text-[11px] font-bold bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">{activity.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.name}</p>
                            <span className="text-xs text-muted-foreground shrink-0">{activity.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {activity.action} · <span className="text-foreground/70 font-medium">{activity.project}</span>
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}
