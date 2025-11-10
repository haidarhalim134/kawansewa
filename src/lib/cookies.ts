import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";


const cookieName = "session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET!);


export type SessionPayload = {
    userId: string;
    email: string;
};


export async function setSessionCookie(
    payload: SessionPayload,
    maxAgeSeconds = 60 * 60 * 24 * 7
) {
    const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${maxAgeSeconds}s`)
        .sign(secret);

    const cookieStore = await cookies(); // ✅ await here

    cookieStore.set(cookieName, jwt, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: maxAgeSeconds,
    });

    return jwt
}

export async function clearSessionCookie() {
    const cookieStore = await cookies(); // ✅ await here

    cookieStore.set(cookieName, "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(cookieName)?.value;

    let token = cookie;

    // 🔄 Fallback: Check Authorization header if no cookie
    if (!token) {
        const headersList = await headers()
        const authHeader = headersList.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.substring(7); // remove "Bearer "
        }
    }

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function requireUser() {
    const session = await getSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
  
    const [user] = await db.select().from(users).where(eq(users.email, session.email));

    if (!user) {
        throw new Error("User not found");
    }
  
    return user;
  }