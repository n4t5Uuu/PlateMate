import {NextResponse} from 'next/server';
import {authHelper} from "@/lib/auth-helper";

async function POST(req: Request) {
    const {email, password, fullName} = await req.json();

    const result = await authHelper.signUp(email, password, fullName);

    if(!result.success || !result.user) {
        return NextResponse.json(
            {
                success: false,
                error: result.error || "Signup failed"
            },
            { status: 400 }
        );
    }

    const {id, email: userEmail, fullName: userFullName, avatar} = result.user;

    return NextResponse.json({
        success: true,
        user: {
            id, 
            email: userEmail,
            fullName: userFullName,
            avatar
        }
    });
}
