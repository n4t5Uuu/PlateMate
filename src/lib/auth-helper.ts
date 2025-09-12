import pb from '@/lib/pb';
import getErrorMessage from './error-message';

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
            const data = {
                email,
                password, 
                passwordConfirm: password,
                fullName, //i think break down parin ito to given name and last name
            }
            
            const record = await pb.collection("users").create(data);

            //send verification email
            await pb.collection("users").requestVerification(email);

            console.log("User Data: " ,record)
            return {success: true, user: record}
        } catch (error) {
            return {success: false, error: getErrorMessage(error)}
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