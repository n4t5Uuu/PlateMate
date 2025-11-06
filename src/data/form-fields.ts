import { InputFieldProps } from "@/components/page-components/login-signup-input";
import { User, Lock, Mail} from "lucide-react";

export const signupFormFields: InputFieldProps[] = [
    {
        id: "signup-first-name",
        label: "First Name",
        type: "text",
        placeholder: "Enter your first name",
        Icon: User,
        required: true,
    },
    {
        id: "signup-last-name",
        label: "Last Name",
        type: "text",
        placeholder: "Enter your last name",
        Icon: User,
        required: true,
    },
    {
        id: "signup-email",
        label: "Email",
        type: "email",
        placeholder: "Enter your email",
        Icon: Mail,
        required: true,
    },
    {
        id: "signup-password",
        label: "Password",
        type: "password",
        placeholder: "Create a password",
        Icon: Lock,
        required: true,
    },
    {
        id: "signup-confirm-password",
        label: "Confirm Password",
        type: "password",
        placeholder: "Confirm your password",
        Icon: Lock,
        required: true,
    }
]

export const loginFormFields: InputFieldProps[] = [
    {
        id: "login-email",
        label: "Email",
        type: "email",
        placeholder: "Enter your email",
        Icon: Mail,
        required: true,
    },
    {
        id: "login-password",
        label: "Password",
        type: "password",
        placeholder: "Enter your password",
        Icon: Lock,
        required: true,
    }
]

export const signUpFieldStateMap = {
    "signup-first-name": "firstName",
    "signup-last-name": "lastName",
    "signup-email": "email",
    "signup-password": "password",
    "signup-confirm-password": "confirmPassword"
} as const;

export const loginFieldStateMap = {
    "login-email": "email",
    "login-password": "password",
} as const;