"use client"

import { useState, useEffect } from "react";
import { authHelper, mapUser, type User } from "@/lib/auth-helper";
import { browserSupabase } from "@/lib/supabase/supabase-browser";

export default function useAuth() {
    const [user, setUser] = useState<Omit<User, "id" | "created_at"> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // checks the active session
        const checkUser = async () => {
            try {
                const currentUser = await authHelper.getCurrentUser(browserSupabase);
                setUser(currentUser)
            } catch (error) {
                // Check if the error is just "Auth session missing!"
                const message = error instanceof Error ? error.message : String(error);
                
                // if the token is bas, force a signout to clear the browser data
                if(message.includes("Refresh Token Not Found") || message.includes("refresh_token_not_found")) {
                    await authHelper.signOut(browserSupabase).catch(() => {});
                }

                // Only log the error if it's NOT the expected "missing session" error
                if (!message.includes("Auth session missing!")) {
                    console.error("Check user failed: ", error);
                }
                
                setUser(null);
            } finally {
                // stops loading even if there was an error
                setLoading(false);
            }
        }

        checkUser();

        // listen to auth changes
        const {data: {subscription}} = browserSupabase.auth.onAuthStateChange(async (event, session) => {
            if(session?.user) {
                const currentUser = await authHelper.getCurrentUser(browserSupabase);
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        })

        return () => {
            subscription.unsubscribe();
        }
    }, []);

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

            if (data.user) {
                const mappedData = mapUser(data.user);
                setUser(mappedData);
                
                setLoading(false);
                return { success: true, user: mappedData };
            }

            setLoading(false);
            return { success: false, error: "No user returned" };
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unexpected error",
            };
        }
    };

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
                    // This creates a redirect link like: http://localhost:3000/api/auth/callback
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

            if (data.user) {
                const mappedData = mapUser(data.user);
                setUser(mappedData);
                
                setLoading(false);
                return { success: true, user: mappedData };
            }

            setLoading(false);
            return { success: false, error: "Signup successful but no user returned" };
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unexpected error",
            };
        }
    };

    const signOut = async () => {
        try {
            await authHelper.signOut(browserSupabase);
            setUser(null);

            return {success: true}
        } catch (error) {
            return {
                success: false, 
                error: error instanceof Error ? error.message : "An unexpected error occurred",
            }
        }   
    };

    return {
        user,
        loading,
        login,
        signUp,
        signOut,
        isAuthenticated: !!user
    };
}