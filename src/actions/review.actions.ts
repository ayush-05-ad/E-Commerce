"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { reviewSchema, ReviewFormValues } from "@/schemas/review.schema";
import { revalidatePath } from "next/cache";

export async function addReview(data: ReviewFormValues) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "You must be logged in to leave a review." };
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const validatedData = reviewSchema.parse(data);

    // Check if the user has already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        productId: validatedData.productId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return { success: false, error: "You have already reviewed this product." };
    }

    // Determine if this is a "Verified Purchase"
    // The user must have a PAID or DELIVERED order containing this productId
    const pastOrder = await db.order.findFirst({
      where: {
        userId: user.id,
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
        items: {
          some: {
            productId: validatedData.productId,
          },
        },
      },
    });

    const isVerifiedPurchase = !!pastOrder;

    // Create the review
    const review = await db.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        productId: validatedData.productId,
        userId: user.id,
        isVerifiedPurchase,
      },
    });

    // Revalidate the product page to show the new review instantly
    revalidatePath(`/products/${validatedData.productId}`);

    return { success: true, review };
  } catch (error) {
    console.error("Review Error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}
