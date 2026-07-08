import {Calendar, CalendarCheck2, Cog, FolderOpen, GroupIcon, Home, LayoutTemplate, LucideIcon, Trash, FolderArchive} from "lucide-react";

export type NavItems = {
    name: string,
    url: string,
    icon: LucideIcon,
}

export const generalNavTabs: NavItems[] = [
    {
        name: "Dasboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        name: "Projects",
        url: "/projects",
        icon: FolderOpen,
    }, 
    {
        name: "Calendar",
        url: "/calendar",
        icon: Calendar,
    },
    {
        name: "Teams", //di pa sure here pero try paren 
        url: "/teams",
        icon: GroupIcon,
        
    },
    {
        name: "Trash", 
        url: "/trash",   //placeholder muna toh for now or place it in the footer where the user can access its profile
        icon: Trash,
    },
    {
        name: "Archived Projects",
        url: "/archive",
        icon: FolderArchive
    }
]

export const shortcutNavTabs: NavItems[] = [
    {
        name: "Schedule Meeting",
        url: "#",
        icon: CalendarCheck2,
    }, 
    {
        name: "Templates (?)",
        url: "#",
        icon: LayoutTemplate,
    },
    
]

export const samplePinnedProjects: NavItems[] = [
    {
        name: "Civic Mall",
        url: "#",
        icon: Cog,
    }
]
