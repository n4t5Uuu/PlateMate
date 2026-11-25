import { clerkMiddleware } from "@clerk/nextjs/server";

// shortcut: only lets the pages read the session (Clerk's auth() and currentUser() throw
// without clerkMiddleware); it protects nothing. T037 replaces this with the deny-by-default
// version, which also redirects signed-out visitors and drops the check in app/page.tsx.
export default clerkMiddleware();

// Clerk's standard matcher: skip Next internals and static files, always run for API routes.
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
