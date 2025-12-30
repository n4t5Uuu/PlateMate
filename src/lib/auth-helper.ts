import { SupabaseClient } from "@supabase/supabase-js";

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string
    avatar?: string; 
    created_at: string;
}

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

    //sign out the user
    async signOut(supabase: SupabaseClient) {
        const {error} = await supabase.auth.signOut();
        if(error)
            throw error;
    },

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