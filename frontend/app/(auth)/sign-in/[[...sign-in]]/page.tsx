import type { Metadata } from "next";
import { AuthPage } from "@/components/auth/auth-page";

export const metadata: Metadata = { title: "Sign in · PlateMate" };

export default function SignInPage() {
  return <AuthPage mode="sign-in" />;
}
