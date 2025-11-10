import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/cookies";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
    const user = await requireUser();
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
        return new Response(JSON.stringify({ error: "Missing password fields" }), { status: 400 });
    }

    // Get current password hash
    const [existingUser] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

    if (!existingUser) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const match = await bcrypt.compare(oldPassword, existingUser.passwordHash);
    if (!match) {
        return new Response(JSON.stringify({ error: "Incorrect current password" }), { status: 401 });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await db.update(users)
        .set({ passwordHash: newHash })
        .where(eq(users.id, user.id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}
