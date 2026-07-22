"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const orderStatusSchema = z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

export async function updateOrderStatus(orderId: string, status: any) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedStatus = orderStatusSchema.parse(status);

    // Ensure the user owns the store that owns this order
    // Since orders in our schema are tied directly to stores via storeId
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          include: {
            seller: true,
          }
        }
      }
    });

    if (!order || order.store.seller.clerkId !== userId) {
      return { success: false, error: "Unauthorized to modify this order" };
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status: validatedStatus },
    });

    revalidatePath("/seller/orders");
    revalidatePath(`/seller/orders/${orderId}`);
    
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Order Update Error:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getSellerOrders(storeId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: { seller: true }
    });

    if (!store || store.seller.clerkId !== userId) {
       return { success: false, error: "Unauthorized" };
    }

    const orders = await db.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        address: true,
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true }
            },
            variant: {
              select: { sku: true, size: true, color: true }
            }
          }
        }
      }
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
