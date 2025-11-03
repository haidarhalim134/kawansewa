"use client";
import { useState } from "react";
import Input from "@/components/Input";
import AuthCard from "@/components/AuthCard";
import { useRouter } from "next/navigation";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        setLoading(false);
        if (res.ok) router.push("/dashboard");
        else setError((await res.json()).error || "Login failed");
    }


    return (
        <AuthCard title="Login" footer={<p>Don't have an account? <a className="underline" href="/register">Register</a></p>}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={loading} className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50">
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
        </AuthCard>
    );
}