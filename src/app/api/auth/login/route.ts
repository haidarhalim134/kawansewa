import { NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth";
import { setSessionCookie } from "@/lib/cookies";


export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
        const user = await verifyUser(email, password);
        if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

        console.log({ userId: user.id, email: user.email })
        await setSessionCookie({ userId: user.id, email: user.email });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}