import {Calendar, CalendarCheck2, Cog, FolderOpen, GroupIcon, Home, LayoutTemplate, LucideIcon, Trash} from "lucide-react";

export type NavItems = {
    name: string,
    url: string,
    icon: LucideIcon,
    isActive: boolean
}

export const generalNavTabs: NavItems[] = [
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

export const shortcutNavTabs: NavItems[] = [
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

export const samplePinnedProjects: NavItems[] = [
    {
        name: "Civic Mall",
        url: "#",
        icon: Cog,
        isActive: false
    }
]

export const sampleProjects: NavItems[] =[
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