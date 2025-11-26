"use client"

import { useState, useEffect } from "react";
import { authHelper, type User } from "@/lib/auth-helper";
import {supabase} from "@/lib/supabase";

export default function useAuth() {
    const [user, setUser] = useState<Omit<User, "id" | "created_at"> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // checks the active session
        const checkUser = async () => {
            const currentUser = await authHelper.getCurrentUser();
            setUser(currentUser)
            setLoading(false);
        }

        checkUser();

        // listen to auth changes
        const {data: {subscription}} = supabase.auth.onAuthStateChange(async (event, session) => {
            if(session?.user) {
                const currentUser = await authHelper.getCurrentUser();
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

            if(!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);

            const result = await res.json();

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

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, firstName, lastName }),
            });

            if(!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);

            const result = await res.json();

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
            await authHelper.signOut();
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