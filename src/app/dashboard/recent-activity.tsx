import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const sampleActivities = [
    {
        id: 1,
        name: "John Doe",
        action: "Completed a task",
        project: "Avenues",
        time: "2 hours ago",
        avatar: "JD"
    },
    {
        id: 2,
        name: "Jane Smith",
        action: "Commented on a task",
        project: "Downtown Office Complex",
        time: "3 hours ago",
        avatar: "JS"
    },
    {
        id: 3,
        name: "Alice Johnson",
        action: "Created a new task",
        project: "The Line",
        time: "5 hours ago",
        avatar: "AJ"
    },
    {
        id: 4,
        name: "Bob Brown",
        action: "Updated task status",
        project: "Riyadh Park",
        time: "1 day ago",
        avatar: "BB"
    }
]

export default function RecentActivity() {
    return (
        <Card className="glass-morphism border-none shadow-lg mb-6">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Recent Activity</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-[15px] before:w-[2px] before:bg-muted/30">
                    {sampleActivities.map((activity) => (
                        <div className="relative flex items-start gap-4 pl-0 group" key={activity.id}>
                            <Avatar className="w-8 h-8 rounded-full border-2 border-background ring-2 ring-primary/20 z-10 bg-background overflow-hidden shadow-sm group-hover:ring-primary/40 transition-all">
                                <AvatarImage />
                                <AvatarFallback className="text-[10px] font-bold bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">{activity.avatar}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-1 pb-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{activity.name}</p>
                                    <span className="text-[10px] font-bold text-muted-foreground/40">{activity.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">{activity.action}</p>
                                <div className="pt-1">
                                    <Badge variant="outline" className="text-[9px] font-bold border-border/50 bg-background/50 hover:border-primary/30 transition-all opacity-80">
                                        {activity.project}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}