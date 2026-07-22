import { db } from "@/lib/db";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      user: {
        select: { name: true, email: true },
      },
      store: {
        select: { name: true },
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
        <AdminOrdersClient initialOrders={orders} />
      </div>
    </div>
  );
}
