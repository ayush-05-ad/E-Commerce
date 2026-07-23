import CartClient from "@/components/shop/CartClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | NXTSTORE",
  description: "Review your items and proceed to checkout on NXTSTORE.",
};

export default function CartPage() {
  return (
    <main className="bg-neutral-50 dark:bg-neutral-900 min-h-screen">
      <CartClient />
    </main>
  );
}
