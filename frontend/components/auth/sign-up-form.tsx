import { ClerkLoading, SignUp } from "@clerk/nextjs";
import { Suspense, useId } from "react";
import { clerkAppearance } from "./clerk-appearance";

const headingClasses = "mb-4 text-3xl font-medium tracking-tight";
// Shown on the server and while Clerk's script loads; holds the form's height so the sheet
// does not jump when it arrives.
const fallbackClasses = "min-h-[22rem] text-sm text-muted-foreground";

function SignUpFallback() {
  return (
    <p role="status" className={fallbackClasses}>
      Loading the form…
    </p>
  );
}

// Clerk's <SignUp /> reads the URL (usePathname), so it must sit in <Suspense> (research R9).
// The heading stays outside it, so the server HTML still has the page's <h1>.
export function SignUpForm() {
  const id = useId();
  return (
    <section aria-labelledby={`${id}-heading`}>
      <h1 id={`${id}-heading`} className={headingClasses}>
        Create account
      </h1>
      <Suspense fallback={<SignUpFallback />}>
        <ClerkLoading>
          <SignUpFallback />
        </ClerkLoading>
        <SignUp appearance={clerkAppearance} />
      </Suspense>
    </section>
  );
}

// What the sheet fades out while switching away from sign-up. A second <SignUp /> must not mount
// on the /sign-in URL, so the leaving pane gets this heading-and-height stand-in instead.
export function SignUpLeaving() {
  return (
    <section aria-hidden>
      <h1 className={headingClasses}>Create account</h1>
      <div className={fallbackClasses} />
    </section>
  );
}
