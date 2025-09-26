import {Input} from "@/components/ui/input";
import {Search} from "lucide-react";

export default function SearchBar() {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"/>
            <Input type="text" placeholder="Search Projects" className="w-64 h-11 pl-11"/>
        </div>
    )
}