"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signupFormFields, signUpFieldStateMap } from "@/data/form-fields";
import InputField from "./LoginSignupInput";
import useAuth from "@/hooks/use-auth";

interface SignUpFormProps {
    onSuccess: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { loading, signUp } = useAuth();
    
    // Use useRef instead of useState to prevent re-renders on keystrokes
    const signUpData = useRef({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { firstName, lastName, email, password, confirmPassword } = signUpData.current;

        if (!email.trim() || !firstName.trim() || !lastName.trim() || !password.trim() || !confirmPassword.trim()) {
            toast.error("Empty Fields", {
                description: "Please fill in the empty fields",
                duration: 3000
            });
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords mismatch", {
                description: "Passwords do not match. Please try again.",
                duration: 3000
            });
            setIsLoading(false);
            return;
        }

        try {
            const result = await signUp(email, password, firstName, lastName);

            if (result.success) {
                // Save the cookie so that the server sees it when navigating back
                document.cookie = "has_account=true; path=/; max-age=31536000; SameSite=Lax";

                toast.success("Account Created Successfully", {
                    description: "Please verify your email, then log in to continue.",
                    duration: 3000
                });
                
                // Notify parent to switch tabs
                onSuccess();
            } else if (result.status === 409) {
                toast.error("User already exists", {
                    description: "Please use a different email.",
                    duration: 3000
                });
            } else {
                toast.error("Signup Failed", {
                    description: result.error || "An error occurred. Please try again.",
                    duration: 3000
                });
            }
        } catch (err) {
            toast.error("Signup Failed", {
                description: "Server or Network error. Please try again later."
            });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="space-y-4">
            <div className="flex items-center content-center gap-x-2">
                {signupFormFields.slice(0, 2).map(fieldData => (
                    <InputField 
                        key={fieldData.id}
                        {...fieldData}
                        onChange={(e) => {
                            signUpData.current[signUpFieldStateMap[fieldData.id as keyof typeof signUpFieldStateMap] as keyof typeof signUpData.current] = e.target.value;
                        }}
                    />
                ))}
            </div>

            {signupFormFields.slice(2).map(fieldData => (
                <InputField 
                    key={fieldData.id}
                    {...fieldData}
                    onChange={(e) => {
                        signUpData.current[signUpFieldStateMap[fieldData.id as keyof typeof signUpFieldStateMap] as keyof typeof signUpData.current] = e.target.value;
                    }}
                />
            ))}

            <div className="flex items-start space-x-2 text-sm">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                <span className="text-gray-600 leading-relaxed">
                    I agree to the {" "}
                    <button type="button" className="text-red-500 hover:text-red-600 font-medium cursor-pointer">Terms of Services</button> and {" "}
                    <button type="button" className="text-red-500 hover:text-red-600 font-medium cursor-pointer">Privacy Policy</button>
                </span>
            </div>

            <Button 
                className="w-full h-12 bg-gradient-to-r from-red-400 via-red-500 
                to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 
                text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 
                transform hover:scale-[1.02] bg-[length:200%_100%] hover:bg-[position:100%_0%] cursor-pointer"
                type="submit"
                disabled={isLoading || loading}>

                {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
        </form>
    );
}
