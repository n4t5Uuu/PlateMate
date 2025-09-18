import {NextResponse} from 'next/server';
import {authHelper} from "@/lib/auth-helper";

export async function POST(req: Request) {
    const {email, password} = await req.json();

    const result = await authHelper.login(email, password);
    
    if(!result.success || !result.user) {
        return NextResponse.json(
            {
                success: false,
                error: "Invalid Credentials"
            },
            {status: 401}
        );
    }

    const {id, email: userEmail, fullName, avatar} = result.user;

    return NextResponse.json({
        success: true,
        user: {
            id,
            email: userEmail,
            fullName,
            avatar
        }
    });
}