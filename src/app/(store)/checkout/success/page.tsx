import Link from "next/link";
import { CheckCircle2, Package, Calendar, ArrowRight, ArrowLeft, MapPin, Landmark, CreditCard, Copy } from "lucide-react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 0;

interface SuccessPageProps {
  searchParams: Promise<{
    orderId?: string;
    productId?: string;
    quantity?: string;
    size?: string;
    color?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  // Fallback: If no orderId is passed, look up single product query details as mockup
  let orderDetails = null;

  if (orderId) {
    orderDetails = await db.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: true,
              }
            },
            variant: true,
          }
        }
      }
    });
  }

  // If orderId is invalid or not found
  if (orderId && !orderDetails) {
    notFound();
  }

  const orderDate = orderDetails
    ? new Date(orderDetails.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const isCOD = orderDetails?.razorpayOrderId === "COD";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Animated Green Checkmark */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        {/* Headers */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {isCOD ? "Order Confirmed!" : "Payment Successful!"}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isCOD 
              ? "Your Cash on Delivery order has been successfully placed."
              : "Thank you for your purchase. Your payment was verified."}
          </p>
        </div>

        {/* Real Order Details Receipt */}
        {orderDetails ? (
          <div className="space-y-6">
            {/* Meta Card */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 space-y-3">
              <div className="flex justify-between items-center text-xs text-neutral-500">
                <span>Order Reference ID</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-300 select-all flex items-center gap-1 font-mono">
                  {orderDetails.id}
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Transaction Date</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-300">{orderDate}</span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Method of Payment</span>
                <span className="font-bold text-neutral-800 dark:text-neutral-300 flex items-center gap-1">
                  {isCOD ? (
                    <>
                      <Landmark className="w-3.5 h-3.5 text-amber-500" /> Cash on Delivery (COD)
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500" /> Online (Razorpay)
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Product Items Table */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-xs text-neutral-400 uppercase tracking-widest">
                Purchased Items
              </h3>
              <div className="border border-neutral-150 dark:border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-150 dark:divide-neutral-800">
                {orderDetails.items.map((item) => {
                  const itemImg = item.product.images.find(img => img.isPrimary)?.url || item.product.images[0]?.url || "/images/product-tee.jpg";
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-900">
                      <div className="w-12 h-12 rounded-lg border bg-neutral-50 dark:bg-neutral-950 overflow-hidden flex-shrink-0">
                        <img src={itemImg} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                          {item.product.brand?.name || "NXTSTORE"}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                          {item.variant?.size && (
                            <span>Size: <strong className="text-neutral-700 dark:text-neutral-300">{item.variant.size}</strong></span>
                          )}
                          {item.variant?.color && (
                            <span>Color: <strong className="text-neutral-700 dark:text-neutral-300">{item.variant.color}</strong></span>
                          )}
                          <span>Qty: <strong className="text-neutral-700 dark:text-neutral-300">{item.quantity}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-neutral-150 dark:border-neutral-800 pt-4 space-y-2 text-xs text-neutral-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-300">₹{(orderDetails.total - (orderDetails.total * 0.08) - (orderDetails.total > 100 ? 0 : 10) < 0 ? 0 : orderDetails.total - (orderDetails.total * 0.08) - (orderDetails.total > 100 ? 0 : 10)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment & Shipping</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-300">Free</span>
              </div>
              <div className="flex justify-between">
                <span>State & Local Tax (8%)</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-300">₹{(orderDetails.total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2 text-sm font-black text-neutral-950 dark:text-white">
                <span>Total Amount Charged</span>
                <span>₹{orderDetails.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Address & Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-150 dark:border-neutral-800 pt-6">
              {orderDetails.address && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Delivery Address
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <strong>{orderDetails.user.name}</strong><br />
                    {orderDetails.address.street}<br />
                    {orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.zipCode}<br />
                    {orderDetails.address.country}<br />
                    <span className="text-[10px] text-neutral-450 block mt-1">Contact: {orderDetails.phone}</span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-neutral-400" /> Estimated Timeline
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Fulfillment is underway. Package is estimated to reach your doorstep on:<br />
                  <strong className="text-neutral-800 dark:text-white mt-1 block">{deliveryDate}</strong>
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Mock fallback details if order ID is missing (for backwards safety) */
          <div className="space-y-6">
            <p className="text-xs text-neutral-400 italic text-center">
              Displaying transaction mockup receipt (missing query identifier).
            </p>
          </div>
        )}

        {/* Back Actions */}
        <div className="pt-4 flex flex-col gap-2">
          <Link
            href="/shop"
            className="w-full py-3.5 px-6 rounded-full font-bold text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
