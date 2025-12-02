import { createServerClient, createBrowserClient } from '@supabase/ssr'
import {cookies} from "next/headers";

// used for server-side client (for server components, API routes)
export async function createServerSupabase() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options))
                    } catch  {
                        
                    }
                }
            }
        }
    )
}

// client-side client (used for client compnents)
export const browserSupabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);