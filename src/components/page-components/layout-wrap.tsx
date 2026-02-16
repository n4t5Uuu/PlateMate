"use client"

import {usePathname} from "next/navigation"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/page-components/sidebar";
import { Separator } from "@/components/ui/separator";

export default function LayoutWrap({children}: {children: React.ReactNode}) {
    const pathname = usePathname();
    
    // checks if the path is in the login page and if the path is the login page
    // return the children and if not, return the sidebar
    const isLoginPage = pathname === "/";

    if(isLoginPage)
        return <>{children}</>;

    return (
        <SidebarProvider>
            <AppSidebar />
            <Separator />
            <SidebarInset>
                <SidebarTrigger />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
