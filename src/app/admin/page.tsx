import { getPlatformStats } from "@/actions/admin.actions";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { db } from "@/lib/db";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const statsRes = await getPlatformStats();
  
  // Default stats fallback if query fails
  const stats = statsRes.success && statsRes.stats ? statsRes.stats : {
    users: 0,
    stores: 0,
    orders: 0,
    totalRevenue: 0
  };

  // Fetch recent 5 orders across all stores
  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      store: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Overview
        </h1>
        <p className="text-neutral-500 mt-2">
          Monitor your platform&apos;s active traffic, stores, and total revenue logs.
        </p>
      </div>

      <DashboardStats stats={stats} />

      {/* Recent Orders Table */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* Recent Transactions List */}
        <div className="col-span-7 lg:col-span-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white mb-4">Platform Sales Log</h3>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs">
              No orders placed across the platform yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Store</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">
                        {order.user?.name || "Customer"} <br />
                        <span className="text-[10px] font-normal text-neutral-400">{order.user?.email}</span>
                      </td>
                      <td className="py-3 font-semibold text-neutral-600 dark:text-neutral-300">
                        {order.store.name}
                      </td>
                      <td className="py-3 text-right font-black text-neutral-950 dark:text-neutral-200">
                        ₹{order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="col-span-7 lg:col-span-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-950 text-white p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 uppercase tracking-widest">
              Platform Info
            </span>
            <h3 className="font-extrabold text-lg">Multi-Vendor Scale</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
              You are currently viewing the system administrator CMS. All transactions are logged securely and processed directly via local Postgres records.
            </p>
          </div>
          <div className="pt-6 border-t border-white/5 text-[10px] text-neutral-500 font-medium">
            System status: <span className="text-emerald-400 font-bold uppercase tracking-wide">ONLINE</span>
          </div>
        </div>

      </div>
    </div>
  );
}
