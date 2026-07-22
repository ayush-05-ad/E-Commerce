"use client";

import { useState, useTransition } from "react";
import { Users, Loader2 } from "lucide-react";
import { changeUserRole } from "@/actions/admin.actions";

interface Count {
  orders: number;
  stores: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SELLER" | "CUSTOMER";
  createdAt: Date;
  _count: Count;
}

interface AdminCustomersClientProps {
  initialUsers: UserItem[];
}

export function AdminCustomersClient({ initialUsers }: AdminCustomersClientProps) {
  const [isPending, startTransition] = useTransition();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  const handleRoleChange = (userId: string, newRole: "ADMIN" | "SELLER" | "CUSTOMER") => {
    startTransition(async () => {
      const res = await changeUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(res.error || "Failed to update user role.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Users & Customers Directory
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Review accounts, view transaction frequencies, and manage administrative roles.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 font-bold uppercase tracking-wider">
                <th className="py-4 px-6">User details</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Activity stats</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-center">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/20">
                  <td className="py-4 px-6">
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{userItem.name}</h4>
                    <p className="text-neutral-500 mt-0.5">{userItem.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      userItem.role === "ADMIN" ? "bg-purple-500/10 text-purple-500" :
                      userItem.role === "SELLER" ? "bg-blue-500/10 text-blue-500" :
                      "bg-neutral-150 dark:bg-neutral-900 text-neutral-500"
                    }`}>
                      {userItem.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-neutral-500">
                    Orders: {userItem._count.orders} &bull; Stores Owned: {userItem._count.stores}
                  </td>
                  <td className="py-4 px-6 text-neutral-500 font-medium">
                    {new Date(userItem.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      disabled={isPending}
                      value={userItem.role}
                      onChange={(e) => handleRoleChange(userItem.id, e.target.value as any)}
                      className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 text-xxs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 dark:text-white mx-auto block"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="SELLER">Seller</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
