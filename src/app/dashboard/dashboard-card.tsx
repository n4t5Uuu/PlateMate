import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import {LucideIcon} from "lucide-react";

interface StatsCardProps {
    title: string
    value: string 
    change: string
    changeType: "positive" | "negative" | "neutral"
    Icon: LucideIcon
}

export function StatsCard({title, value, change, changeType, Icon}: StatsCardProps) {
    const changeColors = {
        positive: "text-green-600",
        negative: "text-red-600",
        neutral: "text-gray-600"
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center space-y-0 justify-between">
                <CardTitle className="text-gray-600 font-medium text-sm">{title}</CardTitle>
                <Icon className="text-gray-400 w-4 h-4"/>
            </CardHeader>

            <CardContent className="-mt-5">
                <div className="font-bold text-2xl">{value}</div>
                <span className={`text-sm ${changeColors[changeType]}`}>{change}</span>
            </CardContent>
        </Card>
    )
}

interface ProjectCardProps {
    projectTitle: string
    clientName: string
    progress: number
    dueDate: string
    status: "active" | "review" | "completed" | "delayed"
    teamMembers?: number
    priority: "high" | "medium" | "low"
}

export function ProjectCard({projectTitle, clientName, progress, dueDate, status, 
    teamMembers, priority}: ProjectCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{projectTitle}</CardTitle>

            </CardHeader>
            
            <CardContent>

            </CardContent>
        </Card>
    )
}