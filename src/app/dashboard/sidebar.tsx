"use client"

import type * as React from "react";
import { 
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail, 
} from "../../components/ui/sidebar";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../../components/ui/dialog";

import {Avatar, AvatarFallback, AvatarImage} from "../../components/ui/avatar";
import {Home, FolderOpen, Pin, Calendar, Cog, GroupIcon, Plus, Trash, CalendarCheck2, LayoutTemplate, LucideIcon} from "lucide-react";

import {SidebarLogo} from "../logo/platemate-logo"

type NavItems = {
    name: string,
    url: string,
    icon: LucideIcon,
    isActive: boolean
}

function renderMenuItem(item: NavItems[]) {
    return item.map((item) => (
        <SidebarMenuItem key={item.name} >
            <SidebarMenuButton asChild >
                <a href={item.url} className={item.isActive ? "active w-full" : "w-full"}>
                    <item.icon />
                    <span>{item.name}</span>
                </a>
            </SidebarMenuButton>
        </SidebarMenuItem>
    ))
}

const generalItem:NavItems[] = [
    {
        name: "Dasboard",
        url: "#",
        icon: Home,
        isActive: true
    },
    {
        name: "Projects",
        url: "#",
        icon: FolderOpen,
        isActive: false
    }, 
    {
        name: "Calendar",
        url: "#",
        icon: Calendar,
        isActive: false
    },
    {
        name: "Teams", //di pa sure here pero try paren 
        url: "#",
        icon: GroupIcon,
        isActive: false
        
    },
    {
        name: "Trash", 
        url: "#",   //placeholder muna toh for now or place it in the footer where the user can access its profile
        icon: Trash,
        isActive: false
    }

]

const shortcutItems: NavItems[] = [
    {
        name: "Schedule Meeting",
        url: "#",
        icon: CalendarCheck2,
        isActive: false
    }, 
    {
        name: "Templates (?)",
        url: "#",
        icon: LayoutTemplate,
        isActive: false
    }
]

//for now the sample projects are stored in a list containing an object
// when ui is done, get the projects in the database and store it somewhere (maybe an list containing multiple objects?)
// so we can display it
const samplePinnedProjects: NavItems[] = [
    {
        name: "Civic Mall",
        url: "#",
        icon: Cog,
        isActive: false
    },
    {
        name: "Skyscraper",
        url: "#",
        icon: Cog,
        isActive: false
    },
    {
        name: "Riyadh Park",
        url: "#",
        icon: Cog,
        isActive: false
    }
]

//for now the sample projects are stored in a list containing an object
// when ui is done, get the projects in the database and store it somewhere (maybe an list containing multiple objects?)
// so we can display it
const sampleWorkspace: NavItems[] =[
    {
        name: "Civic Mall",
        url: "#",
        icon: Cog,
        isActive: false
    },
    {
        name: "Al Qasr Mall",
        url: "#",
        icon: Cog,
        isActive: false
    },
    {
        name: "Skyscraper",
        url: "#",
        icon: Cog,
        isActive: false
    },
    {
        name: "Riyadh Park",
        url: "#",
        icon: Cog,
        isActive: false
    }
]

export default function SideBar({...props} : React.ComponentProps<typeof Sidebar>) {

    //TODO: change the color of the sidebar
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarLogo />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-base mb-1.5">General</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItem(generalItem)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {sampleWorkspace.length > 0 ? (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-base mb-1.5">Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {renderMenuItem(sampleWorkspace)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}

                {/**placeholder for now */}
                {samplePinnedProjects.length > 0 ?(
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-base mb-1.5">Pinned Projects</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {renderMenuItem(samplePinnedProjects)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ) : null}

                <SidebarGroup>
                    <SidebarGroupLabel className="text-base mb-1.5">Quick Actions</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {renderMenuItem(shortcutItems)}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            
            {/*for the footer, this is where the settings and profile of the user*/}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <div className="flex items-center gap-3 p-2">
                                <Avatar>
                                    <AvatarImage />
                                    <AvatarFallback>AO</AvatarFallback> {/**here put the initial of the first and last name of the user */}
                                </Avatar>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-medium">Alden Olmedo</span>
                                    <span className="text-xs font-muted-foreground">Architect</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="#" className= ""> {/**edit this */}
                                <Cog />
                                <span>Settings</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
)
}

