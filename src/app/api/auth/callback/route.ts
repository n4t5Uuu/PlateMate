import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(req: Request) {
    const { searchParams, origin } = new URL(req.url);
    const code = searchParams.get("code");
    
    // If "next" is in the param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const cookieStore = await cookies();
        const response = NextResponse.redirect(`${origin}${next}`); // Create the redirect response first
        
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    // Mutate the outgoing redirect response cookies instead of the global server store
                    set(name: string, value: string, options: CookieOptions) {
                        response.cookies.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        response.cookies.delete({ name, ...options });
                    }
                }
            }
        );

        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return response; // Return the response with the session cookies attached
        }
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}