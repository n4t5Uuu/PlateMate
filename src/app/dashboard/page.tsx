import Sidebar from "@/app/dashboard/sidebar";
import {StatsCard, ProjectCard} from "./dashboard-card";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";

export default function dashboard() {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset>
                <header className="flex items-center h-20 shrink-0 gap-2 border-b bg-white px-6">
                    <SidebarTrigger className="ml-1 cursor-pointer"/>
                    <div className="flex flex-1 items-center justify-between">
                        <div>
                            <h1 className="font-bold text-xl">Dashboard</h1>
                            <p className="text-gray-500">Welcome back, User!</p> {/**ilalagay here yung first name ng user  */}
                        </div>

                        <div>

                        </div>
                    </div>
                </header>
            </SidebarInset>
        </SidebarProvider>
    )
}