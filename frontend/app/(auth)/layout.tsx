import { AuthStage } from "@/components/auth/auth-stage";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <AuthStage>{children}</AuthStage>;
}
