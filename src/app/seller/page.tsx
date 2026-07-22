import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Package, TrendingUp, ShoppingCart, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function SellerDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Find the seller user
  const user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/");
  }

  // 2. Fetch or create store for the seller
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

  // 3. Compute Real Metrics
  // Total Revenue (all paid orders)
  const paidOrders = await db.order.findMany({
    where: { storeId: store.id, isPaid: true },
    select: { total: true },
  });
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

  // Total Sales (sum of quantities from paid order items)
  const paidItems = await db.orderItem.findMany({
    where: { order: { storeId: store.id, isPaid: true } },
    select: { quantity: true },
  });
  const totalSales = paidItems.reduce((sum, item) => sum + item.quantity, 0);

  // Products count
  const productsCount = await db.product.count({
    where: { storeId: store.id, isArchived: false },
  });

  // Pending orders
  const pendingOrdersCount = await db.order.count({
    where: { storeId: store.id, status: "PENDING" },
  });

  // 4. Fetch Recent Orders
  const recentOrders = await db.order.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  // 5. Fetch Low Stock Alerts (< 10 stock)
  const lowStockAlerts = await db.productVariant.findMany({
    where: {
      product: { storeId: store.id },
      stock: { lte: 10 },
    },
    include: {
      product: { select: { name: true } },
    },
    take: 5,
  });

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
    {
      title: "Units Sold",
      value: `+${totalSales}`,
      icon: TrendingUp,
    },
    {
      title: "Active Products",
      value: `${productsCount}`,
      icon: Package,
    },
    {
      title: "Pending Orders",
      value: `${pendingOrdersCount}`,
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto mt-4">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            {store.name}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Store overview, catalog volumes, and tracking updates.
          </p>
        </div>
        <Link 
          href="/seller/products" 
          className="px-5 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-[1.02] transition-transform text-center"
        >
          Manage Catalog
        </Link>
      </div>

      {/* Grid statistics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.title}</h3>
                <Icon className="w-4 h-4 text-neutral-400" />
              </div>
              <span className="text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout (Recent Orders / Alerts) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white mb-4">Recent Invoices</h3>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                      <td className="py-3 font-semibold text-neutral-900 dark:text-white">
                        {order.user?.name || "Customer"} <br />
                        <span className="text-[10px] font-normal text-neutral-400">{order.user?.email}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          order.status === "PAID" ? "bg-emerald-500/10 text-emerald-500" :
                          order.status === "PENDING" ? "bg-amber-500/10 text-amber-500" :
                          "bg-neutral-250 text-neutral-500"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-bold text-neutral-950 dark:text-neutral-200">
                        ₹{order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-sm">
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white mb-4">Stock Warnings</h3>
          {lowStockAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-emerald-500 text-xs gap-2">
              <ShieldCheck className="w-8 h-8" />
              All items are fully stocked!
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                      {alert.product.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      SKU: {alert.sku} &bull; Size: {alert.size || "OS"} &bull; Color: {alert.color || "None"}
                    </p>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    alert.stock === 0 ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-amber-500/10 text-amber-500"
                  }`}>
                    {alert.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick helper
function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-shield-check"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
