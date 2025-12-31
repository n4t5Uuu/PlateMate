import { SupabaseClient } from "@supabase/supabase-js";
import User from "@/types/user";

export function mapUser(user: any): User {
    return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata.firstName,
        lastName: user.user_metadata.lastName,
        avatar: user.user_metadata.avatar,
        created_at: user.created_at
    }
}

export const authHelper = {
    //get the current user
    async getCurrentUser(supabase: SupabaseClient) {
        const {data: {user}, error} = await supabase.auth.getUser();
        if(error) {
            // Check if it's the harmless "missing session" error
            const message = error instanceof Error ? error.message : String(error);
            
            // Only log if it's NOT "Auth session missing!"
            if(!message.includes("Auth session missing!")) {
                console.error("Get User Error:", error)
            }
            
            return null;
        }

        return user ? mapUser(user) : null;
    }
}