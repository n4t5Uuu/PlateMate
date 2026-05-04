import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Runs on the server before every page request.
// Handles session refresh and route protection.
export async function middleware(request: NextRequest) {

    // Default response — just passes the request through with no changes.
    // Gets replaced with a redirect if the user needs to be sent somewhere else.
    let supabaseResponse = NextResponse.next({ request })

    // Create a server-side Supabase client that can read and write cookies.
    // This is needed so Supabase can access and refresh the user's session.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                // Reads the session token from the incoming request's cookies
                getAll() {
                    return request.cookies.getAll()
                },
                // Called when Supabase refreshes an expired token.
                // Writes the new token into both the request and the response
                // so the user stays logged in without having to sign in again.
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                }
            }
        }
    )

    // Checks if there is a valid logged-in user.
    // Also silently refreshes the JWT token if it has expired.
    // Always use getUser() here — never getSession(), which only reads
    // the cookie without validating it with Supabase's server.
    const { data: { user } } = await supabase.auth.getUser()

    // Get the current URL path (e.g. "/dashboard", "/projects")
    const { pathname } = request.nextUrl

    // The login/signup page — the only page a logged-out user can visit
    const isAuthRoute = pathname === '/'

    // Pages that require the user to be logged in
    const isProtectedRoute =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/projects')  ||
        pathname.startsWith('/calendar')  ||
        pathname.startsWith('/teams')     ||
        pathname.startsWith('/trash')     ||
        pathname.startsWith('/settings')  ||
        pathname.startsWith('/workspace') // to check if page toh

    // Logged-in user visiting the auth page → send to dashboard
    if (isAuthRoute && user)
        return NextResponse.redirect(new URL('/dashboard', request.url))

    // Logged-out user visiting a protected page → send to login
    if (isProtectedRoute && !user)
        return NextResponse.redirect(new URL('/', request.url))

    // No redirect needed — return the response (with any refreshed cookies)
    return supabaseResponse
}

// Controls which URLs this middleware runs on.
// Skips Next.js internals and static files (images, icons, fonts)
// since there's no need to check auth for those.
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
}
