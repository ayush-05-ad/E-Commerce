import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SellerProductsClient } from "@/components/seller/SellerProductsClient";

export const revalidate = 0;

export default async function SellerProductsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch seller user
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/");
  }

  // 2. Fetch or create store
  let store = await db.store.findFirst({
    where: { sellerId: user.id },
  });

  if (!store) {
    store = await db.store.create({
      data: {
        name: `${user.name || "Developer"}'s Store`,
        description: "A premium storefront for showcasing products.",
        sellerId: user.id,
        isActive: true,
      },
    });
  }

  // 3. Fetch products of the store
  const products = await db.product.findMany({
    where: { storeId: store.id },
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      images: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Fetch all categories and brands for add form dropdown selectors
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <SellerProductsClient 
          storeId={store.id}
          initialProducts={products}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  );
}
