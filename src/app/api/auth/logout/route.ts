import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/cookies";


export async function POST() {
    await clearSessionCookie();
    // Return success response instead of redirect
    // The client will handle the redirect
    return NextResponse.json({ success: true }, { status: 200 });
}