import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SellerSettingsClient } from "@/components/seller/SellerSettingsClient";

export const revalidate = 0;

export default async function SellerSettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch user
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

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <SellerSettingsClient store={store} />
      </div>
    </div>
  );
}
