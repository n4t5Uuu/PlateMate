import { NextResponse } from "next/server";
import { authHelper } from "@/lib/auth-helper";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, fullName } = body ?? {};

        if (!email || !password || !fullName) {
        return NextResponse.json(
            { success: false, error: "Fields are missing" },
            { status: 400 }
        );
        }

        const result = await authHelper.signUp(email, password, fullName);

        if (result.success) {
        return NextResponse.json(
            { success: true, user: result.user },
            { status: 201 }
        );
        }

        return NextResponse.json(
        { success: false, error: result.error ?? "Signup failed" },
        { status: 400 }
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
