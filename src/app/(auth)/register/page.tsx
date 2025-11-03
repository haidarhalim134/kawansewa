"use client";
import { useState } from "react";
import AuthCard from "@/components/AuthCard";
import Input from "@/components/Input";
import { useRouter } from "next/navigation";


export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        setLoading(false);
        if (res.ok) router.push("/login");
        else setError((await res.json()).error || "Registration failed");
    }


    return (
        <AuthCard title="Create account" footer={<p>Already have an account? <a className="underline" href="/login">Login</a></p>}>
            <form onSubmit={handleSubmit} className="space-y-3">
                <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button disabled={loading} className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50">
                    {loading ? "Creating..." : "Register"}
                </button>
            </form>
        </AuthCard>
    );
}