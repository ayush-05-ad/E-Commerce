import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SellerOrdersClient } from "@/components/seller/SellerOrdersClient";

export const revalidate = 0;

export default async function SellerOrdersPage() {
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

  // 3. Fetch all orders for this store
  const orders = await db.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      user: {
        select: { name: true, email: true },
      },
      items: {
        include: {
          product: { select: { name: true } },
          variant: { select: { sku: true, size: true, color: true } },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <SellerOrdersClient initialOrders={orders} />
      </div>
    </div>
  );
}
