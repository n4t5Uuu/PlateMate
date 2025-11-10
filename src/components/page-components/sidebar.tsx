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
    } from "../ui/sidebar";

    //use dialog for the profile of the user??
    import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogHeader,
        DialogTitle,
        DialogTrigger
    } from "../ui/dialog";

    import {Avatar, AvatarFallback, AvatarImage} from "../ui/avatar";
    import {SidebarLogo} from "./platemate-logo"
    import { NavItems, generalNavTabs, shortcutNavTabs, samplePinnedProjects, sampleProjects} from "@/data/sidebar-data";
    import { Cog, LogOut } from "lucide-react";
    import {toast} from "sonner"
    import useAuth from "@/hooks/use-auth";
    import { useRouter } from "next/navigation";

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

    export default function AppSideBar({...props} : React.ComponentProps<typeof Sidebar>) {
        const {signOut} = useAuth();
        const router = useRouter();

        const handleLogout = async () => {
            try {
                await signOut();
                toast.success("Logged out successfully", {
                    duration: 3000
                });
                router.push("/");
            } catch (error) {
                toast.error("Failed to Log out", {
                    duration: 3000
                });
                console.error(error);
            }
        }

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
                                {renderMenuItem(generalNavTabs)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {sampleProjects.length > 0 ? (
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-base mb-1.5">Workspace</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {renderMenuItem(sampleProjects)}
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
                                {renderMenuItem(shortcutNavTabs)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                
                
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild> 
                                <div className="flex items-center gap-3 p-2">
                                    <Avatar>
                                        <AvatarImage />
                                        <AvatarFallback className="bg-gradient-to-tr from-blue-300 to-red-400 border-2 border-black font-semibold">AY</AvatarFallback> 
                                    </Avatar>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-medium">Alessandra Yadao</span>
                                        <span className="text-xs text-gray-500">Architect</span> 
                                    </div>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        {/**Find a way to map these two */}
                        <SidebarMenuItem className="mt-1">
                            <SidebarMenuButton asChild>
                                <a href="#" className= ""> {/**edit this */}
                                    <Cog />
                                    <span>Settings</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <SidebarMenuItem className="mt-1">
                            <SidebarMenuButton onClick={handleLogout} className="cursor-pointer">
                                <LogOut />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>
        )
    }

