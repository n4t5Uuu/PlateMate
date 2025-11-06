import { SidebarTrigger } from "../ui/sidebar";
import SearchBar from "./search-bar";
import { Button } from "../ui/button";
import {Plus, Bell} from "lucide-react";

interface HeaderProps {
    headerTitle: string
    function: string //placeholder for now but this accepts a function
}

export default function Header() {
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
                a pop up of the notifications will appear 
                make this optional depending on the page*/}
                <Button variant="outline" size="icon" className="cursor-pointer h-11 w-11">
                    <Bell className="h-4 w-4"/>
                </Button>

                <Button variant="outline" className="bg-gradient-to-br from-red-400 to-red-600 cursor-pointer h-11 w-40 
                hover:from-red-500 hover:to-red-800 text-white hover:text-white">
                    <Plus className="w-4 h-4 mr-2"/>
                    New Project
                </Button>
            </div>
        </div>
    </header>
}