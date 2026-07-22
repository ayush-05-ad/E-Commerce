"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
}

interface Category {
  name: string;
}

interface Brand {
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  offerPrice: number;
  discount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category;
  brand: Brand | null;
}

interface ProductDetailsClientProps {
  product: Product;
}

export function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const addItemToCart = useCartStore((state) => state.addItem);

  // Gallery state
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const [activeImageUrl, setActiveImageUrl] = useState<string>(
    primaryImage?.url || "/images/product-tee.jpg"
  );

  // Variant options
  const sizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean))
  ) as string[];
  const colors = Array.from(
    new Set(product.variants.map((v) => v.color).filter(Boolean))
  ) as string[];

  // Selected state
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || "");
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  // Find variant matching selection
  const activeVariant = product.variants.find(
    (v) =>
      (!selectedSize || v.size === selectedSize) &&
      (!selectedColor || v.color === selectedColor)
  ) || product.variants[0];

  const cartItem = {
    id: activeVariant?.id || `default-${product.id}`,
    productId: product.id,
    name: product.name,
    price: product.offerPrice,
    quantity,
    imageUrl: primaryImage?.url || "/images/product-tee.jpg",
    size: selectedSize || undefined,
    color: selectedColor || undefined,
    stock: activeVariant?.stock || 10,
  };

  const handleAddToCart = () => {
    addItemToCart(cartItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    router.push(
      `/checkout?productId=${product.id}&quantity=${quantity}&size=${selectedSize}&color=${selectedColor}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8">
      {/* Back button */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-8 font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Image Gallery */}
        <div className="space-y-4">
          {/* Main Showcase */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-center">
            <img
              src={activeImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white shadow-sm">
                Save {product.discount}%
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageUrl(img.url)}
                  className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white dark:bg-neutral-950 ${
                    activeImageUrl === img.url
                      ? "border-neutral-900 dark:border-white scale-95"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400"
                  }`}
                >
                  <img
                    src={img.url}
                    alt="product preview"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Variant Selectors */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            {/* Headers */}
            <div>
              <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
                {product.brand?.name || "NXTSTORE"} &bull; {product.category.name}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Frame */}
            <div className="p-4 rounded-2xl bg-neutral-100/80 dark:bg-neutral-900/50 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-800/50 inline-flex flex-col gap-1 pr-16">
              <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                Price
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-neutral-900 dark:text-white">
                  ₹{product.offerPrice.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-sm text-neutral-400 line-through">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-wider">
                Description
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-wider">
                  Select Size
                </h3>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-200 ${
                        selectedSize === size
                          ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-wider">
                  Select Color
                </h3>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all duration-200 ${
                        selectedColor === color
                          ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-wider">
                Quantity
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-semibold flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-neutral-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(q + 1, activeVariant?.stock || 10))
                  }
                  className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm font-semibold flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  +
                </button>
                <span className="text-xs text-neutral-400 font-semibold ml-2">
                  {activeVariant?.stock || 0} items available
                </span>
              </div>
            </div>
          </div>

          {/* Call to Actions (Add to Cart / Buy Now) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-4 px-6 rounded-full font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                isAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-750"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isPending}
              className="flex-1 py-4 px-6 rounded-full font-bold text-sm tracking-wide bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center gap-2 shadow-xl shadow-neutral-900/10 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {isPending ? "Initializing..." : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
