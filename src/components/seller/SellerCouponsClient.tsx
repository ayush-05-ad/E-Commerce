"use client";

import { useState, useTransition } from "react";
import { Tags, Trash2, Plus, X, Loader2, Sparkles, Check, Gift } from "lucide-react";
import { createCoupon, deleteCoupon } from "@/actions/coupon.actions";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  expiryDate: Date;
  isActive: boolean;
}

interface SellerCouponsClientProps {
  storeId: string;
  initialCoupons: Coupon[];
}

export function SellerCouponsClient({ storeId, initialCoupons }: SellerCouponsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");
  const [formError, setFormError] = useState("");

  const handleGenerateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let generated = "NXT-";
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(generated);
  };

  const handleDelete = (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    startTransition(async () => {
      const res = await deleteCoupon(couponId);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      } else {
        alert(res.error || "Failed to delete coupon.");
      }
    });
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!code || !discountPercent || !expiryDays) {
      setFormError("All fields are required.");
      return;
    }

    const discountNum = parseFloat(discountPercent);
    const daysNum = parseInt(expiryDays);

    if (isNaN(discountNum) || discountNum <= 0 || discountNum > 100) {
      setFormError("Discount percentage must be a number between 1 and 100.");
      return;
    }

    startTransition(async () => {
      const res = await createCoupon({
        storeId,
        code,
        discountPercent: discountNum,
        expiryDays: daysNum,
      });

      if (res.success && res.coupon) {
        setCoupons((prev) => [res.coupon as Coupon, ...prev]);
        setIsOpen(false);
        setCode("");
        setDiscountPercent("");
      } else {
        setFormError(res.error || "Failed to create coupon code.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Promo Coupons
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Setup discount campaign codes and track active shopping vouchers.
          </p>
        </div>
        <button
          onClick={() => {
            handleGenerateCode();
            setIsOpen(true);
          }}
          className="px-5 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center gap-2 shadow-xl shadow-neutral-900/10"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Grid Table */}
      {coupons.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-12 text-center flex flex-col items-center justify-center gap-4">
          <Tags className="w-12 h-12 text-neutral-400" />
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">No active coupons</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Launch promo codes to reward loyal customers and drive conversions!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Expires on</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();

                  return (
                    <tr key={coupon.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/20">
                      <td className="py-4 px-6 font-black text-sm text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Gift className="w-4 h-4 text-neutral-400" /> {coupon.code}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-neutral-800 dark:text-neutral-200">
                        {coupon.discountPercent}% OFF
                      </td>
                      <td className="py-4 px-6 text-neutral-500 font-medium">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          isExpired ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          disabled={isPending}
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 rounded-xl text-neutral-450 hover:text-red-600 dark:hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50 inline-block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-150 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neutral-900 dark:text-white" />
                <h2 className="font-extrabold text-lg text-neutral-900 dark:text-white">New Discount Code</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 text-red-600 bg-red-50 border border-red-100 rounded-xl font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Coupon Code</label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold underline"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="LEGACY50"
                  className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 font-bold focus:outline-none text-neutral-900 dark:text-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Discount (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="20"
                    className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Active For</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-3 rounded-full text-neutral-500 hover:text-neutral-900 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Coupon
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
