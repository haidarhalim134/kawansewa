import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";


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
      const cookieStore = await cookies(); // ✅ await here
      const cookie = cookieStore.get(cookieName)?.value;
  
      if (!cookie) return null;
  
      try {
          const { payload } = await jwtVerify(cookie, secret);
          return payload as SessionPayload;
      } catch {
          return null;
      }
  }