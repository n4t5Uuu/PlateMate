"use client"

import {useEffect, useState} from "react";
import pb from "@/lib/pb";
import {authHelper, type User} from "@/lib/auth-helper";

export default function useCurrentUser() {
    const [user, setUser] = useState<User | null>(authHelper.getCurrentUser());

    useEffect(() => {
        const unsubscribe = pb.authStore.onChange(() => {
            setUser(authHelper.getCurrentUser());
        });

        console.log(authHelper.getCurrentUser());

        return () => unsubscribe();
    }, [])

    return user;
}