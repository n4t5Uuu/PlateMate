"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loginFormFields, loginFieldStateMap } from "@/data/form-fields";
import InputField from "./LoginSignupInput";
import useAuth from "@/hooks/use-auth";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { loading, login } = useAuth();
    const router = useRouter();
    
    // Use useRef instead of useState to prevent re-renders on keystrokes
    const loginData = useRef({
        email: "",
        password: ""
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const email = loginData.current.email.trim();
        const password = loginData.current.password.trim();

        if (!email || !password) {
            toast.error("Empty Fields", {
                description: "Please fill in the empty fields",
                duration: 3000
            });
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(email, password);

            if (result.success) {
                // Save the cookie in the browser so the server sees it when navigating back
                document.cookie = "has_account=true; path=/; max-age=31536000; SameSite=Lax";

                toast.success("Logged In Successfully", {
                    description: `Welcome back, ${result?.user?.firstName.split(" ")[0] || "User"}!`,
                    duration: 3000
                });

                router.push("/dashboard");
            } else {
                // Log the technical database/backend error to the developer console
                console.error("Login backend error:", result.error);

                // Convert technical jargon to professional, user-friendly notifications
                let userFriendlyDescription = "Please check your credentials and try again.";
                const errorLower = (result.error || "").toLowerCase();
                
                if (errorLower.includes("querying schema") || errorLower.includes("database error") || errorLower.includes("schema")) {
                    userFriendlyDescription = "We are experiencing technical difficulties. Please try again in a few moments.";
                } else if (errorLower.includes("invalid login credentials") || errorLower.includes("invalid_credentials")) {
                    userFriendlyDescription = "The email or password you entered is incorrect.";
                }

                toast.error("Login Failed", {
                    description: userFriendlyDescription,
                    duration: 4000
                });
            }
        } catch (err) {
            // Log code/connection exceptions to the console
            console.error("Login client exception:", err);

            toast.error("Login Failed", {
                description: "Something went wrong. Please try again later.",
                duration: 4000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="space-y-4">
            {loginFormFields.map(field => (
                <InputField
                    key={field.id}
                    {...field}
                    onChange={(e) => {
                        loginData.current[loginFieldStateMap[field.id as keyof typeof loginFieldStateMap] as keyof typeof loginData.current] = e.target.value;
                    }}
                />
            ))}

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-border bg-background text-primary focus:ring-primary" />
                    <span className="text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-primary hover:text-primary/80 font-medium transition-colors">Forget password?</button>
            </div>

            <Button 
                className="w-full h-12 bg-gradient-to-r from-red-400 via-red-500 
                to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 
                text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 
                transform hover:scale-[1.02] bg-[length:200%_100%] hover:bg-[position:100%_0%] cursor-pointer"
                type="submit"
                disabled={isLoading || loading}>
                    
                {isLoading ? "Logging In..." : "Log In"}
            </Button>
        </form>
    );
}
