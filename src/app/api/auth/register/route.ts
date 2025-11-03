import { NextResponse } from "next/server";
import { createUser, registerSchema } from "@/lib/auth";


export async function POST(req: Request) {
    try {
        const json = await req.json();
        const parsed = registerSchema.safeParse(json);
        if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        await createUser(parsed.data);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        const msg = e?.message || "Server error";
        const code = msg.includes("registered") ? 409 : 500;
        return NextResponse.json({ error: msg }, { status: code });
    }
}