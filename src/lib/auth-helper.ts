import {supabase} from "@/lib/SUPABASE"
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string
    avatar?: string; //not sure here
    created: string;
}

function mapUser(user): User {
    return {
        id: user.id,
        email: user.email,
        firstName: user.user_metadata.firstName,
        lastName: user.user_metadata.lastName,
        avatar: user.user_metadata.avatar,
        created: user.created_at
    }
}

export const authHelper = {

    //sign up the user
    async signUp(email: string, password: string, firstName: string, lastName: string) {
        try {
            const {data, error} = await supabase.auth.signUp({
                email,
                password, 
                options: {
                    data: {
                        firstName,
                        lastName
                    }
                }
            })

            if(error)
                throw error

            return {
                success: true,
                user: data.user ? mapUser(data.user) : null
            }

        } catch (error) {
            console.error("Signup Error:", error);
            
            const message = error instanceof Error ? error.message: String(error);
            return { success: false, error: message || "Unknown error occured" };
        }
    },

    //log in the user
    async login(email: string, password: string) {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email, password
            })

            if(error)
                throw error
            
            return {
                sucecss: true,
                user: data.user ? mapUser(data.user) : null
            }
        } catch (error) {
            console.error("Login Error:", error)

            const message = error instanceof Error ? error.message: String(error);
            return {success: false, error: message || "Unknown error occured"}
        }
    },

    //sign out the user
    async signOut() {
        const {error} = await supabase.auth.signOut();
        if(error)
            throw error;
    },

    //get the current user
    async getCurrentUser() {
        const {data: {user}} = await supabase.auth.getUser();
        return user ? mapUser(user) : null;
    }
}