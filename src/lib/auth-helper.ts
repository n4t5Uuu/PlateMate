import pb from '@/lib/pb';
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string
    avatar?: string; //not sure here
    profession?: string;
    created: string;
    updated: string;
}

export const authHelper = {

    //sign up the user
    async signUp(email: string, password: string, firstName: string, lastName: string) {
        try {
            //  Check if user already exists
            const existing = await pb.collection("users").getFirstListItem(`email="${email}"`).catch(() => null);
            if (existing) {
                return { success: false, error: "User already exists" };
            }

            // Create new user (PocketBase auto-hashes the password)
            const record = await pb.collection("users").create({
                email,
                password,
                passwordConfirm: password,
                firstName,
                lastName
            });

            // Send verification email
            //not yet working
            await pb.collection("users").requestVerification(email);

            console.log("User created:", record);
            return { success: true, user: record };

        } catch (error) {
            console.error("Signup Error:", error);
            
            const message = error instanceof Error ? error.message: String(error);
            return { success: false, error: message || "Unknown error occured" };
        }
    },

    //log in the user
    async login(email: string, password: string) {
        try {
            const authData = await pb.collection("users").authWithPassword(email, password);

            console.log("User Data: " ,authData)
            return {success: true, user: authData.record};
        } catch (error) {
            console.error("Login Error:", error)

            const message = error instanceof Error ? error.message: String(error);
            return {success: false, error: message || "Unknown error occured"}
        }
    },

    //sign out the user
    signOut() {
        try {
            return pb.authStore.clear();
            return {success: true}
        } catch (error) {
            console.error("Sign Out Error:", error);

            const message = error instanceof Error ? error.message : String(error);
            return{success: false, error: message || "Unknown error occured"}
        }
    },

    //get the current user
    getCurrentUser() {
        try {
            return pb.authStore.model as User | null;
        } catch (error) {
            console.error("Get Current User Error: ", error)
            return null
        }
    },

    //check if the user is authenticated
    isAuthenticated() {
        try {
            return pb.authStore.isValid;
        } catch (error) {
            console.error("Auth Check Error", error)
            return false;
        }
    }
}