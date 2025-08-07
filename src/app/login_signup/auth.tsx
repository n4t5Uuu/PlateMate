"use client";

import { useState } from "react";
import { Mail, Lock, User} from "lucide-react";

import { Button } from "@/components/ui/button";

import {Card, CardContent, CardHeader, CardTitle, CardDescription} from "@/components/ui/card";
import {Tabs, TabsList, TabsTrigger, TabsContent} from "@/components/ui/tabs";
import {AuthLogo} from "../../components/logo/platemate-logo";
import InputField from "@/components/custom_components/login-signup-input";

export default function Auth() {
    const [formData, setFormData] = useState({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    //ask gpt here kung baket naaccess ung key kahit di siya naka enclosed sa double quotes
    const handleInputChange = (field: string) => 
        (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }))
    }
    
    return (
    <div className="w-screen min-h-screen border-4 flex flex-col items-center justify-center bg-gradient-to-br
                        from-red-50 via-white to-gray-50">
        <div className="w-full max-w-md">
            <AuthLogo />
            
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-bold text-center text-gray-800">Welcome to PlateMate</CardTitle>
                    <CardDescription className="text-center text-gray-500">The personal organizer for Architects</CardDescription>
                </CardHeader>

                <CardContent>
                    <Tabs defaultValue="Login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger 
                                value="Login"
                                className="data-[state=active]:bg-red-400 data-[state=active]:text-gray-900 data-[state=active]:shadow-md
                                            font-medium transition-all duration-300 ease-in-out data-[state=active]:scale-[0.98] rounded-md cursor-pointer">
                                Login
                            </TabsTrigger>

                            <TabsTrigger 
                                value="Sign Up" 
                                className="data-[state=active]:bg-red-400 data-[state=active]:text-gray-900 data-[state=active]:shadow-md
                                            font-medium transition-all duration-300 ease-in-out data-[state=active]:scale-[0.98] rounded-md cursor-pointer">
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        {/*
                            TODO: when the user presses the login or sign in button 
                            and there is nothing on the field, it will show an error message.
                            Create a condition that checks if the field is empty and show an 
                            error message 
                        */}
                        <TabsContent value="Login" className="space-y-4 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                            <InputField 
                                id="login-email"
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                Icon={Mail}
                                onChange={handleInputChange("email")}
                                //required
                                //error={formData.email ? "" : "Email is required"}
                            />
                            
                            <InputField 
                                id="login-password"
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                Icon={Lock}
                                onChange={handleInputChange("password")}
                                //required
                                //error={formData.password ? "" : "Password is required"}
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-red-500 focus:ring-red" />
                                    <span className="text-gray-600">Remember me</span>
                                </label>
                                <button className="text-red-500 hover:text-red-600 font-medium">Forget password?</button>
                            </div>

                            <Button className="w-full h-12 bg-gradient-to-r from-red-400 via-red-500 
                            to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 
                            text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 
                            transform hover:scale-[1.02] bg-[length:200%_100%] hover:bg-[position:100%_0%] cursor-pointer">
                                Sign In
                            </Button>
                        </TabsContent>

                        <TabsContent value="Sign Up" className="space-y-4 animate-in fade-in-50 slide-in-from-right-2 duration-300">
                            <InputField 
                                id="signup-first-name"
                                label="First Name"
                                type="text"
                                placeholder="Enter your first name"
                                Icon={User}
                                onChange={handleInputChange("firstName")}
                                //required
                                //error={formData.email ? "" : "Email is required"}
                            />

                            <InputField 
                                id="signup-middle-name"
                                label="Middle Name"
                                type="text"
                                placeholder="Enter your middle name"
                                Icon={User}
                                onChange={handleInputChange("middleName")}
                                //required
                                //error={formData.email ? "" : "Email is required"}
                            />

                            <InputField 
                                id="signup-last-name"
                                label="Last Name"
                                type="text"
                                placeholder="Enter your last name"
                                Icon={User}
                                onChange={handleInputChange("lastName")}
                                //required
                                //error={formData.email ? "" : "Email is required"}
                            />

                            <InputField 
                                id="signup-email"
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                Icon={Mail}
                                onChange={handleInputChange("email")}
                                //required
                                //error={formData.email ? "" : "Email is required"}
                            />

                            <InputField 
                                id="signup-password"
                                label="Password"
                                type="password"
                                placeholder="Create a password"
                                Icon={Lock}
                                onChange={handleInputChange("password")}
                                //required
                                //error={formData.password ? "" : "Password is required"}
                            />

                            <InputField 
                                id="signup-confirm-password"
                                label="Confirm Password"
                                type="password"
                                placeholder="Confirm your password"
                                Icon={Lock}
                                onChange={handleInputChange("confirmPassword")}
                                //required
                                //error={formData.password ? "" : "Password is required"}
                            />

                            <div className="flex items-start space-x-2 text-sm">
                                <input type="checkbox" className="mt-1 rounded border-gray-300 text-red-500 focus:ring-red-500" />
                                <span className="text-gray-600 leading-relaxed">
                                    I agree to the {" "}
                                    <button className="text-red-500 hover:text-red-600 font-medium cursor-pointer">Terms of Services</button> and {" "}
                                    <button className="text-red-500 hover:text-red-600 font-medium cursor-pointer">Privacy Policy</button>
                                </span>
                            </div>

                            <Button className="w-full h-12 bg-gradient-to-r from-red-400 via-red-500 
                            to-red-600 hover:from-red-500 hover:via-red-600 hover:to-red-700 
                            text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 
                            transform hover:scale-[1.02] bg-[length:200%_100%] hover:bg-[position:100%_0%] cursor-pointer">
                                Create Account
                            </Button>
                        </TabsContent>
                    </Tabs>

                    <div className="mt-6 text-center">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <Button className="h-12 border-gray-200 hover:bg-gray-50 bg-transparent" variant="outline">
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google
                        </Button>

                        <Button className="h-12 border-gray-200 hover:bg-gray-50 bg-transparent" variant="outline">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <p className="text-center text-sm text-gray-500 mt-6 mb-6">Organize your projects, simplify your making</p>
        </div>
    </div>
    )
}