"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingCart, Check, Filter, X } from "lucide-react";
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
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
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

interface ProductGridProps {
  initialProducts: Product[];
  categories: Category[];
}

function ProductGridContent({ initialProducts, categories }: ProductGridProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const addItemToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryParam]);

  // Filter products based on selected category
  const filteredProducts = selectedCategory
    ? initialProducts.filter(
        (product) =>
          product.category.id === selectedCategory ||
          product.category.slug === selectedCategory
      )
    : initialProducts;

  const handleAddToCart = (product: Product) => {
    const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
    const imageUrl = primaryImage?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
    
    // Default to first variant or fallback
    const variant = product.variants[0] || {
      id: `default-${product.id}`,
      size: null,
      color: null,
      stock: 10,
    };

    addItemToCart({
      id: variant.id,
      productId: product.id,
      name: product.name,
      price: product.offerPrice,
      quantity: 1,
      imageUrl: imageUrl,
      size: variant.size || undefined,
      color: variant.color || undefined,
      stock: variant.stock,
    });

    // Show temporary "Added" checkmark state
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Category Filter Sidebar - Desktop */}
      <div className="hidden lg:block space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <Filter className="w-4 h-4 text-neutral-500" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">Filters</h3>
        </div>
        
        <div>
          <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Categories</h4>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedCategory === null
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Category Filters */}
      <div className="lg:hidden flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
            selectedCategory === null
              ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white"
              : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900"
          }`}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
              selectedCategory === category.id
                ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-neutral-900 dark:border-white"
                : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid Area */}
      <div className="lg:col-span-3">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <span className="text-4xl mb-4">🛍️</span>
            <h3 className="text-lg font-bold mb-2">No products found</h3>
            <p className="text-neutral-500 text-sm max-w-sm">
              We couldn&apos;t find any products in this category. Check back later or explore other sections.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
              const imageUrl = primaryImage?.url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
              const isAdded = addedItems[product.id];

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <span className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm">
                      -{product.discount}%
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Brand & Category */}
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                        <span>{product.brand?.name || "NXTSTORE"}</span>
                        <span>{product.category.name}</span>
                      </div>

                      {/* Name */}
                      <h4 className="font-bold text-neutral-900 dark:text-white group-hover:text-neutral-500 transition-colors line-clamp-1 mb-2">
                        {product.name}
                      </h4>
                      
                      {/* Description */}
                      <p className="text-xs text-neutral-500 line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    </div>

                    {/* Price & Cart Actions */}
                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-neutral-100 dark:border-neutral-900">
                      <div>
                        {product.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-xs text-neutral-400 line-through">
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                            <span className="font-bold text-neutral-900 dark:text-white">
                              ₹{product.offerPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-neutral-900 dark:text-white">
                            ₹{product.offerPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdded}
                        className={`p-2.5 rounded-full transition-all duration-300 ${
                          isAdded
                            ? "bg-emerald-600 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900"
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductGrid(props: ProductGridProps) {
  return (
    <Suspense fallback={<div className="text-center py-12 text-neutral-500">Loading catalog...</div>}>
      <ProductGridContent {...props} />
    </Suspense>
  );
}
