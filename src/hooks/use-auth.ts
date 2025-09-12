"use client"

import {useState, useEffect} from "react";
import {authHelper, type User} from "@/lib/auth-helper";

export function useAuth() {
    const [user, setUser] = useState <Omit<User, "id" | "created" | "updated"> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authHelper.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, [])

    const login = async(email: string, password: string) => {
        setLoading(true);
        const result = await authHelper.login(email, password);

        if(result.success && result.user) {
            const mappedData: Omit<User, "id" | "updated" | "created"> = {
                email: result.user.email,
                fullName: result.user.fullName,
                avatar: result.user.avatar,
                profession: result.user.profesion
            }

            setUser(mappedData);
        }
        
        setLoading(false);
        return result;
    }

    const signUp = async(email: string, password: string, fullName: string) => {
        setLoading(true);
        const result = await authHelper.signUp(email, password, fullName);

        if(result.success && result.user) {
            const mappedData: Omit<User, "id" | "updated" | "created"> = {
                email: result.user.email,
                fullName: result.user.fullName,
                avatar: result.user.avatar,
                profession: result.user.profesion
            }

            setUser(mappedData);
        }

        setLoading(false);
        return result;
    }

    const signOut = () => {
        authHelper.signOut()
        setUser(null);
    }

    return {
        user,
        loading, 
        login, 
        signUp,
        signOut,
        isAuhenticated: !!user
    }
}