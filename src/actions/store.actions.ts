"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const storeSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters"),
  description: z.string().optional(),
});

export async function createStore(formData: z.infer<typeof storeSchema>) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = storeSchema.parse(formData);

    // Fetch the internal user ID from Clerk ID
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found in database" };
    }

    const store = await db.store.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        sellerId: user.id,
      },
    });

    revalidatePath("/seller");
    
    return { success: true, store };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateStore(storeId: string, formData: z.infer<typeof storeSchema>) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validatedData = storeSchema.parse(formData);

    const store = await db.store.findUnique({
      where: { id: storeId },
      include: {
        seller: true,
      },
    });

    if (!store || store.seller.clerkId !== userId) {
      return { success: false, error: "Unauthorized to update this store" };
    }

    const updatedStore = await db.store.update({
      where: { id: storeId },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    });

    revalidatePath("/seller");
    revalidatePath("/seller/settings");

    return { success: true, store: updatedStore };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    console.error("Update Store Error:", error);
    return { success: false, error: "Failed to update store settings" };
  }
}
