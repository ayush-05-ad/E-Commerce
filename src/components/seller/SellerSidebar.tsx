"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  Tags,
  Image as ImageIcon,
  Settings,
  ShoppingCart,
  LogOut,
  Store,
} from "lucide-react";

const sidebarLinks = [
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/seller/products", label: "Products", icon: Package },
  { href: "/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/seller/coupons", label: "Coupons", icon: Tags },
  { href: "/seller/media", label: "Media Gallery", icon: ImageIcon },
  { href: "/seller/settings", label: "Store Settings", icon: Settings },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen border-r bg-white dark:bg-neutral-950 flex flex-col z-50">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <Store className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Seller Portal
          </h2>
          <p className="text-xs text-neutral-500">My Premium Store</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={async () => {
            await signOut();
            window.location.href = "/";
          }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
