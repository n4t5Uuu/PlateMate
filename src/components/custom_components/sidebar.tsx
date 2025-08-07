"use client"

import { 
    SidebarProvider, 
    SidebarTrigger,
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup} from "../ui/sidebar";
import {Home, FolderOpen, Pin, Calendar, Cog, GroupIcon} from "lucide-react";

import {SidebarLogo} from "../logo/platemate-logo"

export default function SideBar() {

    const navItems = [
        {
            name: "Dasboard",
            url: "#",
            icon: Home,
            isActive: true
        },
        {
            name: "Projects",
            url: "#",
            icon: FolderOpen
        }, 
        {
            name: "Pinned Projects",
            url: "#",
            icon: Pin
        }, 
        {
            name: "Calendar",
            url: "#",
            icon: Calendar
        },
        {
            name: "Teams",
            url: "#",
            icon: GroupIcon
        },
        {
            name: "Settings",
            url: "#",
            icon: Cog
        }
    ]


    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <SidebarLogo />
                </SidebarHeader>

                <SidebarContent>
                    
                </SidebarContent>
                
                
            </Sidebar>
        </SidebarProvider>
    )
}