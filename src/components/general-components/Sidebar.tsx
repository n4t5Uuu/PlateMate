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
    import {SidebarLogo} from "./PlateMateLogo"
    import { NavItems, generalNavTabs, shortcutNavTabs, samplePinnedProjects } from "@/data/sidebar-data";
    import { Building2, Cog, LogOut, Plus, LayoutGrid, Pin, Zap } from "lucide-react";
    import {toast} from "sonner"

    import useAuth from "@/hooks/use-auth";
    import { useRouter } from "next/navigation";
    import { usePathname } from "next/navigation";
    import { useWorkspaces } from "@/hooks/use-workspaces";
    import { NewWorkspaceDialog } from "@/components/dialogs/NewWorkspaces";

    function renderMenuItem(items: NavItems[], currentPath: string) {
        return items.map((item) => {
            // Compare current URL with item URL
            const isActive = currentPath === item.url;
            return (
                <SidebarMenuItem key={item.name}>
                    {/*adds the isActive prop*/}
                    <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>
                            <item.icon />
                            <span>{item.name}</span>
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        });
    }

    export default function AppSideBar({...props} : React.ComponentProps<typeof Sidebar>) {
        const pathname = usePathname();
        const {user, signOut, loading} = useAuth();
        const router = useRouter();
        const { workspaces } = useWorkspaces();
        const activeWorkspace = workspaces[0];
        
        const handleLogout = async () => {
            try {
                const result = await signOut();
                if(result.success) {
                    toast.success("Logged out successfully", {
                        duration: 3000
                    });
                    
                    console.log("Logged out successfully");

                    router.push("/");
                }
            } catch (error) {
                toast.error("Failed to Log out", {
                    duration: 3000
                });
                console.error(error);
            }
        }


        return (
            <Sidebar variant="inset" className="glass-morphism border-r-0 !bg-sidebar/40" {...props}>
                <SidebarHeader className="pt-4 px-4 pb-0">
                    <SidebarLogo />
                </SidebarHeader>

                <SidebarContent className="px-2 mt-2 custom-scrollbar">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/50 mb-1 pl-2 flex items-center gap-1.5">
                                <LayoutGrid className="w-3 h-3" />
                                General
                            </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {renderMenuItem(generalNavTabs, pathname)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/50 mb-1 pl-2 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3" />
                            Workspace
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {workspaces.map((workspace) => (
                                    <SidebarMenuItem key={workspace.id}>
                                        <SidebarMenuButton asChild isActive={pathname === `/workspace/${workspace.id}`}>
                                            <a href={`/workspace/${workspace.id}`}>
                                                <Building2 className="w-4 h-4" />
                                                <span>{workspace.name}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                                <SidebarMenuItem>
                                    <NewWorkspaceDialog
                                        trigger={
                                            <SidebarMenuButton className="gap-2 text-muted-foreground hover:text-foreground">
                                                <Plus className="w-4 h-4" />
                                                <span>New Workspace</span>
                                            </SidebarMenuButton>
                                        }
                                    />
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {samplePinnedProjects.length > 0 ?(
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/50 mb-1 pl-2 flex items-center gap-1.5">
                                    <Pin className="w-3 h-3" />
                                    Pinned
                                </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {renderMenuItem(samplePinnedProjects, pathname)}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ) : null}

                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/50 mb-1 pl-2 flex items-center gap-1.5">
                                <Zap className="w-3 h-3" />
                                Quick Actions
                            </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {renderMenuItem(shortcutNavTabs, pathname)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                
                
                <SidebarFooter className="p-3 border-t border-border/50 bg-sidebar/20">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild className="hover:bg-accent/50 transition-colors"> 
                                <div className="flex items-center gap-3 w-full">
                                    <Avatar className="h-8 w-8 border border-border/50 shadow-sm">
                                        <AvatarImage src={user?.avatar}/>
                                        <AvatarFallback 
                                            className="bg-gradient-to-tr from-primary to-orange-600 border-none font-bold text-white text-[10px]"
                                        >
                                            {user ? (user.firstName[0] + user.lastName[0]).toUpperCase() : "?" }
                                        </AvatarFallback> 
                                    </Avatar>
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <span className="text-sm font-semibold truncate leading-tight">
                                            {user ? `${user?.firstName.split(" ")[0]} ${user?.lastName}` : "Loading..." }
                                        </span>
                                        <span className="text-[11px] text-muted-foreground truncate">Architect</span>
                                    </div>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                        <div className="flex flex-col gap-1 mt-2">
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild className="h-9 border border-border/40 hover:border-primary/50 transition-all bg-background/20">
                                    <a href="#" className="flex items-center gap-3">
                                        <Cog className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-semibold">Settings</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout} className="h-9 cursor-pointer border border-border/40 hover:border-destructive/50 hover:bg-destructive/10 transition-all bg-background/20 flex items-center gap-3">
                                    <LogOut className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-xs font-semibold">Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </div>
                    </SidebarMenu>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>
        )
    }

