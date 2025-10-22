"use client"

import {LucideIcon, Eye, EyeOff} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useState} from "react";

interface InputFieldProps {
    id: string;
    label: string;
    type: "text" | "email" | "password";
    placeholder:  string;

    required?: boolean;
    Icon: LucideIcon;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export default function InputFields({
    id, label, type = "text", placeholder, required=false, Icon, onChange, error
}: InputFieldProps) {
    const [showPassword, setShowPassword] = useState(false);


    return (
        <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-4.5 h-4 w-4 text-gray-400" />}
                <Input 
                    id={id}
                    //checks if the type is password and if showPassword is true, then it will show the password as text
                    type={type === "password" && showPassword ? "text" : type} 
                    onChange={onChange}
                    className={`pl-9 h-12 border-gray-200 focus:border-red-500 focus:ring-red-500 placeholder:text-sm ${error ? "border-red-500": ""}`}
                    placeholder={placeholder}
                />

                {type === "password" && (
                    //reverses the value of showPassword when its clicked which will toggle the visibility of the password
                    <button 
                        type="button"
                        className="absolute right-3 top-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    )
}

