"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SsoButtons } from "./sso-buttons";

export type AuthMode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    heading: "Sign in",
    sso: "Continue with",
    submit: "Sign in",
    password: "current-password",
  },
  "sign-up": {
    heading: "Create account",
    sso: "Sign up with",
    submit: "Create account",
    password: "new-password",
  },
} as const;

const headingClasses = "mb-4 text-3xl font-medium tracking-tight";
const dividerClasses =
  "my-4 flex items-center gap-3 text-sm text-muted-foreground before:h-px before:flex-1 before:bg-foreground after:h-px after:flex-1 after:bg-foreground";
const fieldClasses = "mb-3 flex flex-col gap-1.5";
const inputClasses =
  "h-11 rounded-lg bg-card px-3.5 focus-visible:ring-[3px] focus-visible:ring-ring";
const submitClasses =
  "mt-4 h-11 w-full focus-visible:ring-[3px] focus-visible:ring-ring";
const linkClasses =
  "h-6 p-0 text-foreground underline underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring";
const noteClasses = "mt-3 min-h-10 text-sm text-muted-foreground";

// shortcut: static placeholder, does not submit. Replaced by Clerk's <SignIn /> / <SignUp />
// once the Clerk keys and ClerkProvider (T017) exist.
export function AuthForm({ mode }: { mode: AuthMode }) {
  const c = copy[mode];
  const id = useId();
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h1 id={`${id}-heading`} className={headingClasses}>
        {c.heading}
      </h1>
      <SsoButtons verb={c.sso} />
      <div className={dividerClasses}>or</div>
      <form>
        <div className={fieldClasses}>
          <Label htmlFor={`${id}-email`}>Email</Label>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            placeholder="name@studio.com"
            className={inputClasses}
          />
        </div>
        <div className={fieldClasses}>
          <Label htmlFor={`${id}-password`}>Password</Label>
          <Input
            id={`${id}-password`}
            type="password"
            autoComplete={c.password}
            className={inputClasses}
          />
        </div>
        <Button type="button" aria-disabled="true" className={submitClasses}>
          {c.submit}
        </Button>
      </form>
      <p className={noteClasses}>
        {mode === "sign-in" ? (
          <Button
            type="button"
            variant="link"
            aria-disabled="true"
            className={linkClasses}
          >
            Forgot your password?
          </Button>
        ) : (
          "Two-step verification is set up after you confirm your email."
        )}
      </p>
    </section>
  );
}
