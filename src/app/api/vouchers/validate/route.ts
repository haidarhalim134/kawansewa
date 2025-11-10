import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vouchers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== "string") {
            return NextResponse.json(
                { error: "Voucher code is required", valid: false },
                { status: 400 }
            );
        }

        // Find voucher by code
        const voucherData = await db
            .select()
            .from(vouchers)
            .where(eq(vouchers.code, code.toUpperCase()))
            .limit(1);

        if (voucherData.length === 0) {
            return NextResponse.json(
                { error: "Invalid voucher code", valid: false },
                { status: 404 }
            );
        }

        const voucher = voucherData[0];

        return NextResponse.json({
            valid: true,
            discountAmount: voucher.discountAmount,
            code: voucher.code,
        });
    } catch (error) {
        console.error("Voucher validation error:", error);
        return NextResponse.json(
            { error: "Internal server error", valid: false },
            { status: 500 }
        );
    }
}
