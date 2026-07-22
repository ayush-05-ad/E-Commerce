"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { categorySchema, CategoryFormValues } from "@/schemas/category.schema";
import { revalidatePath } from "next/cache";

// Utility to verify if the current user is a Super Admin
async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return true;
}

export async function createCategory(data: CategoryFormValues) {
  try {
    await requireAdmin();

    const validatedData = categorySchema.parse(data);

    // Ensure slug uniqueness
    const existingCategory = await db.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingCategory) {
      return { success: false, error: "A category with this slug already exists" };
    }

    const category = await db.category.create({
      data: validatedData,
    });

    revalidatePath("/"); // Update frontend category lists
    return { success: true, category };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function getPlatformStats() {
  try {
    await requireAdmin();

    const [totalUsers, totalStores, totalOrders, revenue] = await Promise.all([
      db.user.count(),
      db.store.count(),
      db.order.count(),
      db.order.aggregate({
        where: { status: { in: ["PAID", "DELIVERED", "SHIPPED", "PROCESSING"] } },
        _sum: { total: true },
      }),
    ]);

    return {
      success: true,
      stats: {
        users: totalUsers,
        stores: totalStores,
        orders: totalOrders,
        totalRevenue: revenue._sum.total || 0,
      },
    };
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return { success: false, error: "Failed to fetch platform stats" };
  }
}

export async function toggleStoreStatus(storeId: string, isActive: boolean) {
  try {
    await requireAdmin();

    const store = await db.store.update({
      where: { id: storeId },
      data: { isActive },
    });

    revalidatePath("/admin/stores");
    return { success: true, store };
  } catch (error) {
    console.error("Toggle Store Error:", error);
    return { success: false, error: "Failed to update store status" };
  }
}

export async function changeUserRole(userId: string, role: "ADMIN" | "SELLER" | "CUSTOMER") {
  try {
    await requireAdmin();

    const user = await db.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/admin/customers");
    return { success: true, user };
  } catch (error) {
    console.error("Change User Role Error:", error);
    return { success: false, error: "Failed to update user role" };
  }
}
