"use client"

import { useState, useEffect } from "react";
import { authHelper, type User } from "@/lib/auth-helper";

export default function useAuth() {
    const [user, setUser] = useState<Omit<User, "id" | "created" | "updated"> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authHelper.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
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

            if (result.success && result.user) {
                const mappedData: Omit<User, "id" | "updated" | "created"> = {
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    avatar: result.user.avatar,
                    profession: result.user.profession,
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

            const result = await res.json();

            if (result.success && result.user) {
                const mappedData: Omit<User, "id" | "updated" | "created"> = {
                    email: result.user.email,
                    firstName: result.user.firstName,
                    lastName: result.user.lastName,
                    avatar: result.user.avatar,
                    profession: result.user.profession,
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
        setLoading(true);
        try {
            authHelper.signOut();
            setUser(null);
            setLoading(false);
            return {success: true}
        } catch (error) {
            return{
                success: false,
                error: error instanceof Error ? error.message : "Logout Failed"
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