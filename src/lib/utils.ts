import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { vouchers, voucherUsed } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type ValidateVoucherInput = {
  code: string;
  userId: number;
};

export async function validateVoucherForUser({
  code,
  userId,
}: ValidateVoucherInput) {
  const today = new Date();

  const voucher = await db.query.vouchers.findFirst({
    where: and(
      eq(vouchers.code, code),
      eq(vouchers.isActive, 1),
      sql`${today} BETWEEN ${vouchers.startDate} AND ${vouchers.endDate}`
    ),
  });

  if (!voucher) {
    return [false, "Voucher not found/inactive"];
  }

  if (voucher.maxUsage != 0) {
    const [{ count }] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(voucherUsed)
      .where(eq(voucherUsed.voucherId, voucher.id));

    if (count > voucher.maxUsage) {
      return [false, "Voucher ran out"]; // maksudnya habis
    }

  }

  const alreadyUsed = await db.query.voucherUsed.findFirst({
    where: and(
      eq(voucherUsed.voucherId, voucher.id),
      eq(voucherUsed.userId, userId)
    ),
  });

  if (alreadyUsed) {
    return [false, "Voucher used by user"];
  }

  return [true, voucher];
}
