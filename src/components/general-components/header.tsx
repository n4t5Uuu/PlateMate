"use client"

import { SidebarTrigger } from "../ui/sidebar";
import SearchBar from "./SearchBar";
import { Button } from "../ui/button";
import { Plus, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NewProjectDialog } from "@/components/dialogs/NewProject";
import {useWorkspaces} from "@/hooks/use-workspaces"

export default function Header() {
    const pathname = usePathname();
    const {workspaces} = useWorkspaces()

    // for the header title whenever the user switches pages, the name of the page will be displayed in the header 
    // For example, if the user is on the "/projects" page, the header will display "Projects". If the user is on the "/settings" page, 
    // the header will display "Settings". If the user is on the "/" page, the header will display "Home".
    const headerTitle = pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)

    return (
        <header className="flex items-center h-20 shrink-0 gap-4 border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-10 px-8 transition-all">
            <SidebarTrigger className="cursor-pointer hover:text-primary transition-colors"/>
            <div className="flex flex-1 items-center justify-between">
                <div>
                    <h1 className="font-bold text-xl tracking-tight leading-none">{headerTitle}</h1>
                    <p className="text-muted-foreground text-xs mt-1 font-medium italic opacity-70">Architectural Workspace</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <SearchBar />
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        
                        <Button variant="outline" size="icon" className="cursor-pointer h-10 w-10 border-border/80 hover:border-primary/50 transition-all bg-transparent shadow-sm">
                            <Bell className="h-4 w-4"/>
                        </Button>

                        <NewProjectDialog
                            workspaceId={workspaces[0]?.id ?? ""}
                            trigger={
                                <Button variant="default" className="accent-gradient h-10 px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all border-none">
                                    <Plus className="w-4 h-4 mr-2"/>
                                    New Project
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}