"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { 
  Trash2, 
  Lock, 
  Gift, 
  CheckCircle2, 
  Share2, 
  Bookmark, 
  ArrowRight, 
  ShoppingBag 
} from "lucide-react";

export default function CartClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGift, setIsGift] = useState(false);

  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getCartTotal, 
    getCartCount 
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  const cartTotal = getCartTotal();
  const cartCount = getCartCount();

  const handleShare = (productId: string, itemId: string) => {
    const url = `${window.location.origin}/products/${productId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(itemId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto border border-neutral-200 dark:border-neutral-800">
          <ShoppingBag className="w-10 h-10 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
            Your Shopping Cart is empty
          </h1>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Explore our curated catalog of apparel, accessories, and tech items to fill your cart.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Shortcuts */}
        <div className="grid grid-cols-3 gap-4 pt-12 max-w-lg mx-auto">
          {["Apparel", "Tech", "Accessories"].map((cat) => (
            <Link
              key={cat}
              href={`/shop?category=${cat.toLowerCase()}`}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-450 dark:hover:border-neutral-550 transition-colors text-center text-xs font-bold text-neutral-700 dark:text-neutral-300"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-baseline justify-between border-b border-neutral-150 dark:border-neutral-800 pb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
              Shopping Cart
            </h1>
            <span className="text-xs text-neutral-400 font-medium hidden md:block">Price</span>
          </div>

          {/* Cart Item Row List */}
          <div className="divide-y divide-neutral-150 dark:divide-neutral-850">
            {items.map((item) => (
              <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row gap-6">
                
                {/* Product Image */}
                <Link
                  href={`/products/${item.productId}`}
                  className="w-full md:w-32 h-32 rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 flex-shrink-0 relative group"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-bold text-base md:text-lg text-neutral-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-500 hover:underline transition-colors leading-tight"
                      >
                        {item.name}
                      </Link>
                      
                      {/* Price on mobile (hidden on desktop) */}
                      <span className="font-extrabold text-base text-neutral-950 dark:text-white md:hidden flex-shrink-0">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                    </p>

                    {/* Attributes */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 pt-1">
                      {item.size && (
                        <span className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-md">
                          Size: <strong className="text-neutral-800 dark:text-neutral-200 font-bold">{item.size}</strong>
                        </span>
                      )}
                      {item.color && (
                        <span className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-md">
                          Color: <strong className="text-neutral-800 dark:text-neutral-200 font-bold">{item.color}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-neutral-400 font-semibold select-none">
                    
                    {/* Quantity Select */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-neutral-800 dark:text-neutral-200">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Qty:</span>
                      <select
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="bg-transparent border-0 font-extrabold focus:outline-none cursor-pointer text-xs"
                      >
                        {Array.from({ length: Math.min(10, item.stock) }, (_, i) => i + 1).map((val) => (
                          <option key={val} value={val} className="text-neutral-900 dark:text-white bg-white dark:bg-neutral-950">
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-neutral-200 dark:text-neutral-800">|</span>

                    {/* Delete Action */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 hover:underline transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>

                    <span className="text-neutral-200 dark:text-neutral-800">|</span>

                    {/* Save for later Action */}
                    <button
                      onClick={() => alert("Saved to Wishlist!")}
                      className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Save for Later
                    </button>

                    <span className="text-neutral-200 dark:text-neutral-800">|</span>

                    {/* Share Action */}
                    <button
                      onClick={() => handleShare(item.productId, item.id)}
                      className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white transition-colors relative cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" /> 
                      {copiedId === item.id ? "Copied Link!" : "Share"}
                    </button>

                  </div>
                </div>

                {/* Price Column on Desktop */}
                <div className="hidden md:flex flex-col items-end justify-start flex-shrink-0 pt-1">
                  <span className="font-extrabold text-lg text-neutral-950 dark:text-white">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-neutral-450 mt-0.5">
                    (₹{item.price.toFixed(2)} each)
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Subtotal Bottom */}
          <div className="border-t border-neutral-150 dark:border-neutral-800 pt-6 flex flex-col md:flex-row items-end justify-between gap-4">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your cart?")) {
                  useCartStore.getState().clearCart();
                }
              }}
              className="text-xs font-bold text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear Cart Summary
            </button>
            <div className="text-right">
              <span className="text-neutral-600 dark:text-neutral-400 text-sm">
                Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"}):{" "}
              </span>
              <strong className="text-xl md:text-2xl font-black text-neutral-950 dark:text-white">
                ₹{cartTotal.toFixed(2)}
              </strong>
            </div>
          </div>

        </div>

        {/* Right Column: Checkout Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Free Delivery Promo */}
            <div className="flex items-start gap-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                  Your order qualifies for FREE Delivery.
                </p>
                <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                  Select the free delivery option during order payment verification.
                </p>
              </div>
            </div>

            {/* Total Details */}
            <div className="space-y-2">
              <div className="text-base text-neutral-700 dark:text-neutral-300">
                Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"}):
              </div>
              <div className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                ₹{cartTotal.toFixed(2)}
              </div>
            </div>

            {/* Gift Checkbox */}
            <label className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors select-none cursor-pointer">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-neutral-300 dark:border-neutral-700 text-amber-500 accent-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-bold">
                <Gift className="w-4 h-4 text-amber-500" />
                This order contains a gift
              </div>
            </label>

            {/* Checkout CTA: Amazon-style Premium Button */}
            <button
              onClick={() => router.push("/checkout")}
              className="w-full py-4 rounded-full text-sm font-extrabold transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-md bg-gradient-to-r from-amber-450 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-amber-550 text-neutral-900 hover:shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-2 border border-amber-500/30"
            >
              Proceed to Buy <ArrowRight className="w-4.5 h-4.5" />
            </button>

            {/* Secure Lock Detail */}
            <div className="flex items-center justify-center gap-1.5 text-xxs text-neutral-450 uppercase tracking-widest font-black pt-2">
              <Lock className="w-3.5 h-3.5 text-neutral-400" /> Secure transaction
            </div>

          </div>

          {/* Extra Help / Trust Policy Card */}
          <div className="bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-150 dark:border-neutral-850/50 rounded-3xl p-5 text-xs text-neutral-500 space-y-2.5">
            <h4 className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              NXTSTORE Protection Policy
            </h4>
            <p className="leading-relaxed">
              Enjoy complete peace of mind. We verify every vendor's product authenticity, coordinate immediate dispatch tracking, and process secure payments via standard Razorpay configurations or Cash on Delivery.
            </p>
          </div>

        </div>

      </div>
      
      {/* CSS stylesheet helper for xxs font */}
      <style jsx>{`
        .text-xxs {
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
}
