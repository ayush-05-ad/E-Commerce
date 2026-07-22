import { db } from "@/lib/db";
import { AdminStoresClient } from "@/components/admin/AdminStoresClient";

export const revalidate = 0;

export default async function AdminStoresPage() {
  const stores = await db.store.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: { name: true, email: true },
      },
      _count: {
        select: { products: true, orders: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <AdminStoresClient initialStores={stores} />
      </div>
    </div>
  );
}
