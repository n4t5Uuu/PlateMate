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

    const login = async(email: string, password: string) => {
        setLoading(true);
        try {
            const result = await authHelper.login(email, password);

            if (result.success && result.user) {
                const mappedData: Omit<User, "id" | "updated" | "created"> = {
                    email: result.user.email,
                    fullName: result.user.fullName,
                    avatar: result.user.avatar,
                    profession: result.user.profession
                };
                setUser(mappedData);
            }
            
            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            };
        }
    };

    const signUp = async(email: string, password: string, fullName: string) => {
        setLoading(true);
        try {
            const result = await authHelper.signUp(email, password, fullName);

            if (result.success && result.user) {
                const mappedData: Omit<User, "id" | "updated" | "created"> = {
                    email: result.user.email,
                    fullName: result.user.fullName,
                    avatar: result.user.avatar,
                    profession: result.user.profession
                };
                setUser(mappedData);
            }

            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            return {
                success: false,
                error: error instanceof Error ? error.message : "An unexpected error occurred"
            };
        }
    };

    const signOut = () => {
        authHelper.signOut();
        setUser(null);
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