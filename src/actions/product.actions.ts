"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { productSchema, ProductFormValues } from "@/schemas/product.schema";
import { revalidatePath } from "next/cache";

export async function createProduct(data: ProductFormValues) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate incoming data
    const validatedData = productSchema.parse(data);

    // Verify store ownership
    const store = await db.store.findFirst({
      where: {
        id: validatedData.storeId,
        seller: { clerkId: userId },
      },
    });

    if (!store) {
      return { success: false, error: "Unauthorized to add products to this store" };
    }

    // Calculate discount automatically
    const discount = Math.round(
      ((validatedData.originalPrice - validatedData.offerPrice) / validatedData.originalPrice) * 100
    );

    // Use Prisma Transaction to ensure atomic creation of Product + Variants + Images
    const product = await db.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        originalPrice: validatedData.originalPrice,
        offerPrice: validatedData.offerPrice,
        discount: discount,
        categoryId: validatedData.categoryId,
        brandId: validatedData.brandId,
        storeId: validatedData.storeId,
        isFeatured: validatedData.isFeatured,
        isArchived: validatedData.isArchived,
        images: {
          createMany: {
            data: validatedData.images.map((img) => ({
              url: img.url,
              isPrimary: img.isPrimary,
            })),
          },
        },
        variants: {
          createMany: {
            data: validatedData.variants.map((v) => ({
              sku: v.sku,
              size: v.size,
              color: v.color,
              stock: v.stock,
            })),
          },
        },
      },
      include: {
        images: true,
        variants: true,
        category: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    // Automatically trigger Next.js cache revalidation so the Customer Storefront updates instantly
    revalidatePath("/");
    revalidatePath(`/products/${product.id}`);
    revalidatePath("/seller/products");

    return { success: true, product };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Internal Server Error" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          include: {
            seller: true,
          },
        },
      },
    });

    if (!product || product.store.seller.clerkId !== userId) {
      return { success: false, error: "Unauthorized to delete this product" };
    }

    await db.product.delete({
      where: { id: productId },
    });

    revalidatePath("/");
    revalidatePath("/seller/products");

    return { success: true };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function updateVariantStock(variantId: string, stock: number) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          include: {
            store: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!variant || variant.product.store.seller.clerkId !== userId) {
      return { success: false, error: "Unauthorized to update this variant" };
    }

    const updated = await db.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });

    revalidatePath("/");
    revalidatePath("/seller/products");

    return { success: true, variant: updated };
  } catch (error) {
    console.error("Update Variant Stock Error:", error);
    return { success: false, error: "Failed to update variant stock" };
  }
}
