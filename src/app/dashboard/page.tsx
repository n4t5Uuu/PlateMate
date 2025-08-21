import AppSidebar from "@/components/general-components/sidebar";
import {StatsCard, ProjectCard} from "./dashboard-card";
import SearchBar from "../../components/general-components/search-bar";

import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {Button} from "@/components/ui/button";
import {Plus, Bell, FolderOpen, Clock, CheckCircle, Users, Funnel} from "lucide-react";

export default function dashboard() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex items-center h-20 shrink-0 gap-2 border-b bg-white px-6">
                    <SidebarTrigger className="ml-01 cursor-pointer"/>
                    <div className="flex flex-1 items-center justify-between">
                        <div>
                            <h1 className="font-bold text-xl mb-0.5">Dashboard</h1>
                            <p className="text-gray-500 text-sm">Welcome back, User!</p> {/**ilalagay here yung first name ng user  */}
                        </div>
                            
                        <div className="flex items-center gap-4">
                            <SearchBar />

                            {/*in here the notifs bar, when the user clicks on it
                            a pop up of the notifications will appear */}
                            <Button variant="outline" size="icon" className="cursor-pointer h-11 w-11">
                                <Bell className="h-4 w-4"/>
                            </Button>

                            <Button className="bg-gradient-to-br from-red-400 to-red-600 cursor-pointer h-11 w-40 hover:from-red-500 hover:to-red-800">
                                <Plus className="w-4 h-4 mr-2"/>
                                New Project
                            </Button>
                        </div>
                    </div>
                </header>
                
                {/*Main Content*/}
                <div className="flex-1 space-y-6 p-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatsCard 
                            title="Active Projects"
                            value="12"
                            change="+2 from last month"
                            changeType="positive"
                            Icon={FolderOpen}
                        />

                        <StatsCard 
                            title="Pending Tasks"
                            value="24"
                            change="+5 from yesterday"
                            changeType="neutral"
                            Icon={Clock}
                        />

                        <StatsCard 
                            title="Team Members"
                            value="18"
                            change="+3 new this week"
                            changeType="positive"
                            Icon={Users}
                        />

                        <StatsCard 
                            title="Completed"
                            value="8"
                            change="+2 this week"
                            changeType="positive"
                            Icon={CheckCircle}
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-lg text-gray-900">Active Projects</h2>
                                <div className="flex items-center justify-center gap-2">
                                    <Button variant="outline" className="cursor-pointer">
                                        <Funnel className="w-4 h-4"/>
                                        Filter
                                    </Button>
                                    <Button variant="outline" className="cursor-pointer">
                                        View All
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1">

                            </div>
                        </div>

                        <div className="lg:col-span-1 border-3 border-black">

                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}