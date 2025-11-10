"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/cookies";

export async function logout() {
    await clearSessionCookie();
    redirect("/login");
}
