import Link from "next/link";
import { cn } from "@/lib/utils";
import { AuthForm, type AuthMode } from "./auth-form";
import { AuthPane } from "./auth-pane";

const tabs = [
  { mode: "sign-in", href: "/sign-in", label: "Sign in" },
  { mode: "sign-up", href: "/sign-up", label: "Create account" },
] as const;
const sheetLabels: Record<AuthMode, string> = {
  "sign-in": "Sheet A-001 · Sign in · Rev A",
  "sign-up": "Sheet A-002 · Create account · Rev A",
};

const tabsClasses = "my-5 flex rounded-full border border-foreground p-[3px]";
const tabClasses =
  "flex h-10 flex-1 items-center justify-center rounded-full text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const tabActiveClasses = "bg-foreground text-background hover:bg-foreground";
const labelClasses =
  "mt-6 border-t border-foreground pt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground";

export function AuthPage({ mode }: { mode: AuthMode }) {
  return (
    <>
      <nav aria-label="Account" className={tabsClasses}>
        {tabs.map((tab) => (
          <Link
            key={tab.mode}
            href={tab.href}
            aria-current={tab.mode === mode ? "page" : undefined}
            className={cn(tabClasses, tab.mode === mode && tabActiveClasses)}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <AuthPane mode={mode}>
        <AuthForm mode={mode} />
        <p className={labelClasses}>{sheetLabels[mode]}</p>
      </AuthPane>
    </>
  );
}
