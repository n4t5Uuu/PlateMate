import {supabase} from "@/lib/supabase";

interface Activity {
    id: string
    user: string
    action: string
    project?: string
    details?: string
    created_at: string
}

