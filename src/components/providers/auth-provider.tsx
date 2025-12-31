"use client"

import React, {createContext, useContext, useEffect, useState} from "react";
import {mapUser} from "@/lib/auth-helper";
import User from "@/types/user";
import {browserSupabase} from "@/lib/supabase/supabase-browser";

// 1. Define what data we want to share globally
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
    signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children:React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // check for the user on the initial load
        const checkUser = async () => {
            const {data: {user}} = await browserSupabase.auth.getUser();

            if(user)
                setUser(mapUser(user));

            setLoading(false);
        };

        checkUser();

        // listn for real-time changes (login/logout)
        const{data: {subscription}} = browserSupabase.auth.onAuthStateChange((event, session) => {
            if(session?.user)
                setUser(mapUser(session.user));
            else
                setUser(null);

            setLoading(false);
        });

        return () => subscription.unsubscribe();
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

            // Note: setUser happens automatically via onAuthStateChange listener!
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
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};