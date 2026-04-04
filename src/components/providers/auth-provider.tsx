"use client"

import React, {createContext, useContext, useEffect, useState} from "react";
import {mapUser} from "@/lib/auth-helper";
import User from "@/types/user";
import {browserSupabase} from "@/lib/supabase/supabase-browser";

/**
 * Shape of the authentication context data.
 */
interface AuthContextType {
    /** The currently logged-in user or null if not authenticated */
    user: User | null;
    /** Boolean indicating if the initial auth check is in progress */
    loading: boolean;
    /** Function to log in a user with email and password */
    login: (email: string, password: string) => Promise<any>;
    /** Function to sign up a new user */
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
    /** Function to sign out the current user */
    signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that wraps the application and provides authentication state.
 * Handles initial session check and listens for real-time auth changes.
 * 
 * @param children - The child components to wrap.
 */
export function AuthProvider({children}: {children:React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /**
         * Checks for an existing Supabase session on mount.
         */
        const checkUser = async () => {
            const {data: {user}} = await browserSupabase.auth.getUser();

            if(user)
                setUser(mapUser(user));

            setLoading(false);
        };

        checkUser();

        /**
         * Sets up a listener for auth state changes (login, logout, session refresh).
         */
        const {data: {subscription}} = browserSupabase.auth.onAuthStateChange((event, session) => {
            if(session?.user)
                setUser(mapUser(session.user));
            else
                setUser(null);

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /**
     * Logs in a user using Supabase Email/Password authentication.
     * 
     * @param email - User's email address.
     * @param password - User's password.
     * @returns Promise resolving to success flag and user/error data.
     */
    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const { data, error } = await browserSupabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                setLoading(false);
                return {
                    success: false,
                    error: error.message,
                    status: (error as any).status,
                    code: (error as any).code
                };
            }

            setLoading(false);
            if (data.user) {
                return { success: true, user: mapUser(data.user) };
            }
            return { success: false, error: "No user returned" };

        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unexpected error",
            };
        }
    };

    /**
     * Registers a new user and sets up their metadata (firstName, lastName).
     * 
     * @param email - User's email address.
     * @param password - User's password.
     * @param firstName - User's first name.
     * @param lastName - User's last name.
     * @returns Promise resolving to success flag and user/error data.
     */
    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        setLoading(true);
        try {
            const { data, error } = await browserSupabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        firstName,
                        lastName
                    },
                    emailRedirectTo: `${window.location.origin}/api/auth/callback` 
                }
            });

            if (error) {
                setLoading(false);
                return {
                    success: false,
                    error: error.message,
                    status: (error as any).status,
                    code: (error as any).code
                };
            }

            setLoading(false);
            if (data.user) {
                return { success: true, user: mapUser(data.user) };
            }
            return { success: false, error: "Signup successful but no user returned" };

        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unexpected error",
            };
        }
    };

    /**
     * Signs out the current user and clears the state.
     * 
     * @returns Promise resolving to success flag.
     */
    const signOut = async () => {
        try {
            await browserSupabase.auth.signOut();
            setUser(null);
            return { success: true }; 
        } catch (error) {
            return { success: false, error: error }; 
        }
    }

    return (
        <AuthContext.Provider value={{user, loading, login, signUp, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

// Export the hook so other components can use it
/**
 * Custom hook to easily access authentication state and methods from any client component.
 * Must be used within an AuthProvider.
 * 
 * @returns The current authentication context.
 * @throws Error if used outside of an AuthProvider.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};