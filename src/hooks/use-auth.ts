"use client"

import { useState, useEffect } from "react";
import { authHelper, type User } from "@/lib/auth-helper";
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
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const result = await res.json();

            if(!res.ok) {
                setLoading(false);

                // return the error info from the server
                return {
                    success: false,
                    error: result.error || `HTTP error! status: ${result.status}`,
                    status: result.status,
                    code: result.code,
                }
            }

            if (result.success && result.user) {
                const mappedData: Omit<User, "id" | "created_at"> = {
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    avatar: result.user.avatar,
                }
                setUser(mappedData);
            }

            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred",
            };
        }
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            const result = await res.json();

            // If the request failed (like 409 or 400), we still want to return the result
            // because it contains the specific error message and we can add the status.
            if (!res.ok) {
                setLoading(false);
                
                return {
                    success: false,
                    error: result.error || `HTTP error! status: ${res.status}`,
                    status: res.status // Pass the status code back!
                };
            }

            if (result.success && result.user) {
                const mappedData: Omit<User, "id" | "created_at"> = {
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    avatar: result.user.avatar,
                };
                setUser(mappedData);
            }

            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred",
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