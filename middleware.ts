import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";


const cookieName = "session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);


export async function middleware(req: NextRequest) {
    const jwt = req.cookies.get(cookieName)?.value;
    if (!jwt) return NextResponse.redirect(new URL("/login", req.url));
    try {
        await jwtVerify(jwt, secret);
        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}


export const config = {
    matcher: ["/dashboard"],
};