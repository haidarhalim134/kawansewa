import * as React from "react";
import { cn } from "@/lib/utils";


type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string };
export default function Input({ className, label, error, ...props }: Props) {
    return (
        <label className="block space-y-1">
            {label && <span className="text-sm text-gray-600">{label}</span>}
            <input
                className={cn(
                    "w-full rounded-xl border px-3 py-2 outline-none focus:ring",
                    error ? "border-red-500" : "border-gray-300",
                    className
                )}
                {...props}
            />
            {error && <span className="text-xs text-red-600">{error}</span>}
        </label>
    );
}