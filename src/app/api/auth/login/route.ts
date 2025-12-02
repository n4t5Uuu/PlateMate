import { NextResponse } from "next/server";
import { authHelper } from "@/lib/auth-helper";
import { createServerSupabase } from "@/lib/supabase-server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body ?? {};

        if (!email || !password) {
        return NextResponse.json(
            { success: false, error: "Fields are missing" },
            { status: 400 }
            );
        }

        const supabase = await createServerSupabase();
        const result = await authHelper.login(supabase, email, password);

        if (result.success) {
        return NextResponse.json(
            { success: true, user: result.user },
            { status: 200 }
            );
        }

        return NextResponse.json(
        { success: false, error: result.error ?? "Invalid credentials" },
        { status: 401 }
        );
    } catch (err) {
        const message =
        typeof err === "string"
            ? err
            : err instanceof Error
            ? err.message
            : "Unknown error";

        return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
        );
    }
}
