import { z } from "zod";
import bcrypt  from "bcrypt";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";


export const registerSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
});


export async function createUser(input: z.infer<typeof registerSchema>) {
    const { name, email, password } = input;
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length) throw new Error("Email already registered");
    const passwordHash = await bcrypt.hash(password, 12);
    const [row] = await db.insert(users).values({ name, email, passwordHash }).returning();
    return row;
}


export async function verifyUser(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;
    return user;
}