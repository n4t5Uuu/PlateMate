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
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>

            <CardContent>
                {sampleActivities.map((activity) => (
                    <div className="flex items-start space-x-3 mb-3" key={activity.id}>
                        <Avatar className="w-8 h-8">
                            <AvatarImage />
                            <AvatarFallback className="text-sm border-2 border-black 
                            font-semibold text-center p-2">{activity.avatar}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{activity.name}</span>
                                <span className="text-sm text-gray-600">{activity.action}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                    {activity.project}
                                </Badge>
                                <span className="text-sm text-gray-600">{activity.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}