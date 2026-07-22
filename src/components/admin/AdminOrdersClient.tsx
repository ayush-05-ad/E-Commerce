"use client";

import { useState } from "react";
import { ShoppingBag, ChevronDown, ChevronUp, MapPin, Truck } from "lucide-react";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  id: string;
  product: { name: string };
  variant: { sku: string; size: string | null; color: string | null } | null;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  phone: string | null;
  createdAt: Date;
  address: Address | null;
  user: { name: string; email: string };
  store: { name: string };
  items: OrderItem[];
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders] = useState<Order[]>(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Platform Invoices Log
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Inspect, track, and monitor shipments across all stores.
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-12 text-center flex flex-col items-center justify-center gap-4">
          <ShoppingBag className="w-12 h-12 text-neutral-400" />
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">No transactions found</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            There are no customer invoices registered in the system yet.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-8"></th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Store</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Fulfillment</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;

                  return (
                    <>
                      <tr 
                        key={order.id} 
                        className={`border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/20 cursor-pointer ${
                          isExpanded ? "bg-neutral-50/10 dark:bg-neutral-900/10" : ""
                        }`}
                        onClick={() => toggleExpand(order.id)}
                      >
                        <td className="py-4 px-6 text-center">
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-450" /> : <ChevronDown className="w-4 h-4 text-neutral-450" />}
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-900 dark:text-white uppercase">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-800 dark:text-neutral-200">
                          {order.store.name}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-neutral-800 dark:text-neutral-200">{order.user.name}</div>
                          <span className="text-[10px] text-neutral-400 font-medium block">{order.user.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                            order.status === "PAID" ? "bg-emerald-500/10 text-emerald-500" :
                            order.status === "PENDING" ? "bg-amber-500/10 text-amber-500" :
                            order.status === "DELIVERED" ? "bg-blue-500/10 text-blue-500" :
                            "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-neutral-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-neutral-950 dark:text-white">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>

                      {/* Expandable Shipment details */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-900 animate-in fade-in duration-300">
                          <td colSpan={7} className="py-6 px-12 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              
                              {/* Shipping address details */}
                              <div className="space-y-3">
                                <h4 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-neutral-400" /> Shipping Destination
                                </h4>
                                {order.address ? (
                                  <div className="text-neutral-600 dark:text-neutral-350 text-xs space-y-1 font-medium pl-6">
                                    <p className="font-bold text-neutral-900 dark:text-white">{order.user.name}</p>
                                    <p>{order.address.street}</p>
                                    <p>{order.address.city}, {order.address.state} {order.address.zipCode}</p>
                                    <p>{order.address.country}</p>
                                    <p className="text-[10px] text-neutral-450 mt-1">Contact: {order.phone || "No Phone"}</p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-neutral-400 pl-6 italic">No shipping address provided.</p>
                                )}
                              </div>

                              {/* Items list detail */}
                              <div className="space-y-3">
                                <h4 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-neutral-400" /> Package Contents
                                </h4>
                                <div className="space-y-2 pl-6">
                                  {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-xs border-b border-neutral-100 dark:border-neutral-850 pb-2 last:border-0 last:pb-0">
                                      <div className="min-w-0 pr-4">
                                        <p className="font-bold text-neutral-900 dark:text-white truncate">
                                          {item.product.name}
                                        </p>
                                        <p className="text-[10px] text-neutral-450 mt-0.5">
                                          SKU: {item.variant?.sku || "N/A"} &bull; Size: {item.variant?.size || "OS"} &bull; Color: {item.variant?.color || "N/A"}
                                        </p>
                                      </div>
                                      <div className="flex-shrink-0 text-right">
                                        <span className="font-bold text-neutral-900 dark:text-white">${item.price.toFixed(2)}</span>
                                        <span className="text-[10px] text-neutral-400 block mt-0.5">Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
