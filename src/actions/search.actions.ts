"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface SearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
}

export async function searchProducts(params: SearchParams) {
  try {
    const {
      query,
      categoryId,
      minPrice,
      maxPrice,
      rating,
      sort = "newest",
      page = 1,
      limit = 12,
    } = params;

    // Build the dynamic WHERE clause
    const where: Prisma.ProductWhereInput = {
      isArchived: false,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.offerPrice = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    // Notice: Rating filtering requires aggregating the reviews. 
    // In a high-scale production app, it's better to store an 'averageRating' float on the Product table 
    // and update it via a database trigger or after every review, rather than aggregating on the fly.
    // Assuming we added `averageRating` to the Product schema for performance:
    if (rating !== undefined) {
       // where.averageRating = { gte: rating }; // Placeholder for actual schema implementation
       // For now, we will do post-filtering or omit if averageRating isn't on the schema.
    }

    // Build the dynamic ORDER BY clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};

    switch (sort) {
      case "price_asc":
        orderBy = { offerPrice: "asc" };
        break;
      case "price_desc":
        orderBy = { offerPrice: "desc" };
        break;
      case "popular":
        // Sorting by number of order items (mock popularity)
        orderBy = { orderItems: { _count: "desc" } };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
          category: {
            select: { name: true },
          },
        },
      }),
      db.product.count({ where }),
    ]);

    return {
      success: true,
      data: {
        products,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Search Error:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}
