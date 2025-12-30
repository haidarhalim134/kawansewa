import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/cookies";
import { validateVoucherForUser } from "@/lib/serverUtils";

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Voucher code is required", valid: false },
                { status: 400 }
            );
        }

        const user = await requireUser();

        const [valid, voucher] = await validateVoucherForUser({
            code: code.toUpperCase(),
            userId: user.id,
        });

        if (!valid) {
            return NextResponse.json(
                { error: `Voucher cannot be used. ${voucher}`, valid: false },
                { status: 400 }
            );
        }

        return NextResponse.json({
            valid: true,
            code: voucher.code,
            discountAmount: voucher.discountAmount,
        });
    } catch (error) {
        console.error("Voucher validation error:", error);
        return NextResponse.json(
            { error: "Internal server error", valid: false },
            { status: 500 }
        );
    }
}
