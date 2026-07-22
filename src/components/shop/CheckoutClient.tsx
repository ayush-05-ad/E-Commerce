"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, ChevronRight, Lock, ShoppingBag, Loader2, Landmark, HelpCircle, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { createRazorpayOrder, verifyRazorpayPayment, createCODOrder } from "@/actions/checkout.actions";
import Script from "next/script";

interface ProductImage {
  url: string;
}

interface Product {
  id: string;
  name: string;
  offerPrice: number;
  brand: { name: string } | null;
  images: ProductImage[];
}

interface CheckoutClientProps {
  singleProduct: Product | null;
  singleProductDetails: {
    quantity: number;
    size: string | null;
    color: string | null;
  };
}

export function CheckoutClient({ singleProduct, singleProductDetails }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Stepper state: 'address' | 'payment'
  const [step, setStep] = useState<"address" | "payment">("address");

  // Form states - Address
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [addressError, setAddressError] = useState("");

  // Payment Selection state: 'razorpay' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [paymentError, setPaymentError] = useState("");
  const [showMockNotification, setShowMockNotification] = useState(false);

  // Determine items in order
  const orderItems = singleProduct
    ? [
        {
          id: `default-${singleProduct.id}`,
          productId: singleProduct.id,
          name: singleProduct.name,
          price: singleProduct.offerPrice,
          quantity: singleProductDetails.quantity,
          imageUrl: singleProduct.images[0]?.url || "/images/product-tee.jpg",
          size: singleProductDetails.size || undefined,
          color: singleProductDetails.color || undefined,
          stock: 10,
        },
      ]
    : cartItems;

  const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !stateName || !zipCode || !country) {
      setAddressError("Please fill in all shipping details.");
      return;
    }
    setAddressError("");
    setStep("payment");
  };

  const handleOrderCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    if (paymentMethod === "cod") {
      // Process Cash on Delivery
      startTransition(async () => {
        const result = await createCODOrder(orderItems, {
          street,
          city,
          state: stateName,
          zipCode,
          country,
          phone,
        });

        if (result.success) {
          if (!singleProduct) {
            clearCart();
          }
          router.push(`/checkout/success?orderId=${result.orderId}`);
        } else {
          setPaymentError(result.error || "Failed to complete Cash on Delivery order.");
        }
      });
    } else {
      // Process Razorpay
      startTransition(async () => {
        const result = await createRazorpayOrder(orderItems, {
          street,
          city,
          state: stateName,
          zipCode,
          country,
          phone,
        });

        if (!result.success) {
          setPaymentError(result.error || "Failed to initiate payment.");
          return;
        }

        // If in mock sandbox mode (no API keys configured on backend)
        if (result.isMock) {
          setShowMockNotification(true);
          setIsVerifying(true);
          
          setTimeout(async () => {
            const verifyRes = await verifyRazorpayPayment(
              result.orderId!,
              result.razorpayOrderId!,
              "pay_mock_success_12345",
              "signature_mock_12345"
            );
            
            setIsVerifying(false);
            setShowMockNotification(false);

            if (verifyRes.success) {
              if (!singleProduct) {
                clearCart();
              }
              router.push(`/checkout/success?orderId=${result.orderId}`);
            } else {
              setPaymentError(verifyRes.error || "Mock sandbox validation failed.");
            }
          }, 2000);
          return;
        }

        // Load real Razorpay options
        const options = {
          key: result.keyId,
          amount: result.amount,
          currency: result.currency,
          name: "NXTSTORE",
          description: "Secure Order Payment",
          image: "/images/category-accessories.jpg", // placeholder brand logo
          order_id: result.razorpayOrderId,
          handler: async function (response: any) {
            setIsVerifying(true);
            const verifyRes = await verifyRazorpayPayment(
              result.orderId!,
              result.razorpayOrderId!,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            setIsVerifying(false);

            if (verifyRes.success) {
              if (!singleProduct) {
                clearCart();
              }
              router.push(`/checkout/success?orderId=${result.orderId}`);
            } else {
              setPaymentError(verifyRes.error || "Payment verification failed.");
            }
          },
          prefill: {
            name: fullName,
            contact: phone,
          },
          theme: {
            color: "#18181b", // Charcoal/zinc theme matching NXTSTORE
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setPaymentError(response.error.description || "Payment failed. Please try again.");
        });
        rzp.open();
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8">
      {/* Load Razorpay script dynamically */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Full-Screen Verifying Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white animate-in fade-in duration-300">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-white">Verifying Transaction</h3>
              <p className="text-xs text-neutral-400">
                {showMockNotification
                  ? "Simulating Razorpay sandbox secure response..."
                  : "Securing signature confirmation with payment server..."}
              </p>
            </div>
            {showMockNotification && (
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 rounded-full tracking-wider uppercase animate-pulse">
                Mock Mode Activated
              </span>
            )}
          </div>
        </div>
      )}

      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-8">
        Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Checkout Stepper Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stepper Headers */}
          <div className="flex items-center gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <button
              onClick={() => setStep("address")}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                step === "address" ? "text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                step === "address" ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white" : "border-neutral-300"
              }`}>1</span>
              Shipping Address
            </button>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
            <button
              disabled={step === "address" && !street}
              onClick={() => setStep("payment")}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                step === "payment" ? "text-neutral-900 dark:text-white" : "text-neutral-400 disabled:opacity-50"
              }`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                step === "payment" ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white" : "border-neutral-300"
              }`}>2</span>
              Payment Options
            </button>
          </div>

          {/* Step 1: Address Form */}
          {step === "address" && (
            <form onSubmit={handleAddressSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <MapPin className="w-5 h-5 text-neutral-500" />
                <h2 className="font-extrabold text-lg text-neutral-900 dark:text-white">Shipping Details</h2>
              </div>

              {addressError && (
                <div className="p-3.5 text-xs font-semibold bg-red-50 text-red-650 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl">
                  {addressError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ayush Deep"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Apartment, suite, unit, or street name"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="New Delhi"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">State / Province</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Delhi"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">ZIP / Postal Code</label>
                  <input
                    type="text"
                    required
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="110001"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full font-bold text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-[1.02] transition-transform flex items-center gap-2 cursor-pointer"
                >
                  Proceed to Payment <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Payment Selector */}
          {step === "payment" && (
            <form onSubmit={handleOrderCheckout} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-neutral-500" />
                  <h2 className="font-extrabold text-lg text-neutral-900 dark:text-white">Choose Payment Method</h2>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
                  <Lock className="w-3 h-3" /> Secure SSL
                </span>
              </div>

              {paymentError && (
                <div className="p-3.5 text-xs font-semibold bg-red-50 text-red-650 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-xl">
                  {paymentError}
                </div>
              )}

              {/* Modern Radio Selection Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Razorpay Option */}
                <div
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer flex flex-col justify-between h-40 transition-all hover:scale-[1.01] hover:shadow-md ${
                    paymentMethod === "razorpay"
                      ? "border-neutral-900 bg-neutral-50/50 dark:border-white dark:bg-neutral-950/40"
                      : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "razorpay" ? "border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white" : "border-neutral-300"
                    }`}>
                      {paymentMethod === "razorpay" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Pay Online (Razorpay)</h3>
                    <p className="text-[10.5px] text-neutral-450 mt-1">Cards, UPI, Netbanking, Wallets</p>
                  </div>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-6 rounded-2xl border-2 cursor-pointer flex flex-col justify-between h-40 transition-all hover:scale-[1.01] hover:shadow-md ${
                    paymentMethod === "cod"
                      ? "border-neutral-900 bg-neutral-50/50 dark:border-white dark:bg-neutral-950/40"
                      : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/30 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "cod" ? "border-neutral-900 bg-neutral-900 dark:border-white dark:bg-white" : "border-neutral-300"
                    }`}>
                      {paymentMethod === "cod" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-neutral-900" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Cash on Delivery (COD)</h3>
                    <p className="text-[10.5px] text-neutral-450 mt-1">Pay with cash when package arrives</p>
                  </div>
                </div>

              </div>

              {/* Informative message for payments */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 flex items-start gap-3">
                <HelpCircle className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5 text-neutral-500 text-xs leading-relaxed font-medium">
                  {paymentMethod === "razorpay" ? (
                    <p>
                      You will be redirected to the secure Razorpay payment modal. Transactions will be processed in INR (<strong>₹{total.toFixed(2)}</strong>).
                    </p>
                  ) : (
                    <p>
                      Your order will be verified immediately. Pay <strong>₹{total.toFixed(2)}</strong> in cash to the delivery executive when they arrive at your shipping address.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Edit Address
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-3.5 rounded-full font-bold text-xs bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-[1.02] transition-transform flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethod === "cod" ? "Place COD Order" : "Proceed to Pay"} (₹{total.toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Right Column: Invoice/Order Summary (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <ShoppingBag className="w-5 h-5 text-neutral-500" />
            <h2 className="font-extrabold text-lg text-neutral-900 dark:text-white">Order Summary</h2>
          </div>

          {/* List items in invoice */}
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {orderItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-neutral-50 border border-neutral-100 dark:bg-neutral-950 dark:border-neutral-850 overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-450 mt-0.5">
                    {item.size && <span>Size: <strong>{item.size}</strong></span>}
                    {item.color && <span>Color: <strong>{item.color}</strong></span>}
                    <span>Qty: <strong>{item.quantity}</strong></span>
                  </div>
                </div>
                <span className="font-bold text-xs text-neutral-950 dark:text-neutral-200 flex-shrink-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Calculation */}
          <div className="border-t border-neutral-150 dark:border-neutral-800 pt-4 space-y-2 text-xs text-neutral-500">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-300">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-300">
                {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-300">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-neutral-100 dark:border-neutral-800 pt-2 text-sm font-black text-neutral-950 dark:text-white">
              <span>Order Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
