"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createCoupon(data: {
  storeId: string;
  code: string;
  discountPercent: number;
  expiryDays: number;
}) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify store ownership
    const store = await db.store.findFirst({
      where: {
        id: data.storeId,
        seller: { clerkId: userId },
      },
    });

    if (!store) {
      return { success: false, error: "Unauthorized to manage coupons for this store" };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + data.expiryDays);

    const coupon = await db.coupon.create({
      data: {
        storeId: data.storeId,
        code: data.code.toUpperCase().trim(),
        discountPercent: data.discountPercent,
        expiryDate: expiryDate,
        isActive: true,
      },
    });

    revalidatePath("/seller/coupons");
    return { success: true, coupon };
  } catch (error) {
    console.error("Create Coupon Error:", error);
    return { success: false, error: "Failed to create coupon code. Check for duplicates." };
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
      include: { store: { include: { seller: true } } },
    });

    if (!coupon || coupon.store.seller.clerkId !== userId) {
      return { success: false, error: "Unauthorized to delete this coupon" };
    }

    await db.coupon.delete({
      where: { id: couponId },
    });

    revalidatePath("/seller/coupons");
    return { success: true };
  } catch (error) {
    console.error("Delete Coupon Error:", error);
    return { success: false, error: "Failed to delete coupon." };
  }
}
