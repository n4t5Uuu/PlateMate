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
        high: "bg-red-100 text-red-800 text-sm rounded-xl",
        medium: "bg-yellow-100 text-yellow-800 text-sm rounded-xl",
        low: "bg-green-100 text-green-800 text-sm rounded-xl"
    }

    const statusColors = {
        Active: "bg-blue-600",
        Review: "bg-purple-600",
        Completed: "bg-green-600",
        Delayed: "bg-red-600"
    }

    //siguro limited yung list of projects na makikita ni user here sa dashboard, pag naexceed yung size limit
    //irerender lang yung kaya nya or irender lang yung pinaka recent projects
    return (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold">{projectTitle}</CardTitle>
                        {/**add an option where the user can edit the icon of their project */}
                        <p className="text-gray-500 text-sm mt-1">{clientName}</p>
                    </div>
                    <Badge className={`${priorityColors[priority]} self-start`} variant="secondary">
                        {priority}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="-mt-4">
                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500">Progress</p>
                        <p className="font-semibold">{progress}%</p>
                    </div>
                    <Progress value={progress} className="h-2 rounded-full mt-1 mb-4"/>
                    <div className="flex space-y-3 mt-2 flex-col">

                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <Clipboard className="w-4 h-4 text-gray-500"/>
                                <p className="text-sm text-gray-500">{dueDate}</p>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-500"/>
                                <p className="text-sm text-gray-500">{teamMembers} members</p>
                            </div>
                        </div>

                        <div className="w-full flex items-center justify-between">
                            <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                            <div className="flex -space-x-2">
                                {[1,2,3].map((i) => (
                                    <Avatar key={i} className="w-6 h-6">
                                        <AvatarImage/> {/**dont forget the image of the members who are part of the project */}
                                        <AvatarFallback className="text-xs border-2 border-black"></AvatarFallback> 
                                    </Avatar>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}