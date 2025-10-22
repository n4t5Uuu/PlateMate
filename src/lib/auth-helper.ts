import pb from '@/lib/pb';
import getErrorMessage from './error-message';

//i think iseparate yung first and last name
export interface User {
    id: string;
    email: string;
    fullName: string;
    avatar?: string; //not sure here
    profession?: string;
    created: string;
    updated: string;
}

export const authHelper = {

    //sign up the user
    async signUp(email: string, password: string, fullName: string) {
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
                fullName,
            });

            // Send verification email
            await pb.collection("users").requestVerification(email);

            console.log("User created:", record);
            return { success: true, user: record };

        } catch (error: any) {
            console.error("Signup Error:", error);

            // More reliable error message handling
            const message = error?.data?.message || error?.message || "Unknown error occurred";

            return { success: false, error: message };
        }
    },

    //log in the user
    async login(email: string, password: string) {
        try {
            const authData = await pb.collection("users").authWithPassword(email, password);

            console.log("User Data: " ,authData)
            return {success: true, user: authData.record};
        } catch (error) {
            return {success: false, error: getErrorMessage(error)}
        }
    },

    //sign out the user
    signOut() {
        return pb.authStore.clear();
    },

    //get the current user
    getCurrentUser() {
        return pb.authStore.model as User | null;
    },

    //check if the user is authenticated
    isAuthenticated() {
        return pb.authStore.isValid;
    }
}