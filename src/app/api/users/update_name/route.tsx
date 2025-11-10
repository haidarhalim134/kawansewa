import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const user = await requireUser(); // Ensure user is logged in
    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return new Response(JSON.stringify({ error: "Invalid name" }), { status: 400 });
    }

    await db.update(users)
        .set({ name })
        .where(eq(users.id, user.id));

    return new Response(JSON.stringify({ success: true, name }), { status: 200 });
}