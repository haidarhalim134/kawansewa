import Link from "next/link";


export default function AuthCard({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
    return (
        <div className="mx-auto mt-16 max-w-md rounded-2xl border bg-white p-6 shadow-sm">
            <h1 className="mb-6 text-center text-2xl font-semibold">{title}</h1>
            <div className="space-y-4">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
        </div>
    );
}