"use client";

import { useState, useTransition } from "react";
import { Store, ShieldAlert, Check, Loader2, Play, Pause } from "lucide-react";
import { toggleStoreStatus } from "@/actions/admin.actions";

interface Seller {
  name: string;
  email: string;
}

interface Count {
  products: number;
  orders: number;
}

interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  seller: Seller;
  _count: Count;
}

interface AdminStoresClientProps {
  initialStores: StoreItem[];
}

export function AdminStoresClient({ initialStores }: AdminStoresClientProps) {
  const [isPending, startTransition] = useTransition();
  const [stores, setStores] = useState<StoreItem[]>(initialStores);

  const handleToggleStatus = (storeId: string, currentActiveState: boolean) => {
    const newState = !currentActiveState;

    startTransition(async () => {
      const res = await toggleStoreStatus(storeId, newState);
      if (res.success) {
        setStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, isActive: newState } : s))
        );
      } else {
        alert(res.error || "Failed to update store status.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Stores Directory
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Activate or suspend registered vendor storefronts across the platform.
        </p>
      </div>

      {/* Stores List */}
      {stores.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-12 text-center flex flex-col items-center justify-center gap-4">
          <Store className="w-12 h-12 text-neutral-400" />
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">No stores registered</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Sellers will appear here once they sign up and activate their storefront portal.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Store details</th>
                  <th className="py-4 px-6">Seller</th>
                  <th className="py-4 px-6">Stats</th>
                  <th className="py-4 px-6">Fulfillment</th>
                  <th className="py-4 px-6 text-center">Toggle State</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/20">
                    <td className="py-4 px-6">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{store.name}</h4>
                      <p className="text-neutral-500 mt-0.5 truncate max-w-xs">{store.description || "No description provided."}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">{store.seller.name}</div>
                      <span className="text-[10px] text-neutral-400 font-medium block">{store.seller.email}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-neutral-500">
                      Products: {store._count.products} &bull; Orders: {store._count.orders}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        store.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {store.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggleStatus(store.id, store.isActive)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 mx-auto ${
                          store.isActive 
                            ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400" 
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400"
                        }`}
                      >
                        {isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : store.isActive ? (
                          <>
                            <Pause className="w-3 h-3" /> Suspend
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
