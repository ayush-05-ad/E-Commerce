import { db } from "@/lib/db";
import { AdminCustomersClient } from "@/components/admin/AdminCustomersClient";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true, stores: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <AdminCustomersClient initialUsers={users} />
      </div>
    </div>
  );
}
