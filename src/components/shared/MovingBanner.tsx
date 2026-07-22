"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProductImage {
  url: string;
}

interface Product {
  id: string;
  name: string;
  originalPrice: number;
  offerPrice: number;
  discount: number;
  images: ProductImage[];
  brand: { name: string } | null;
}

interface MovingBannerProps {
  products: Product[];
}

export function MovingBanner({ products }: MovingBannerProps) {
  // Duplicate list to achieve seamless infinite loop
  const duplicatedProducts = [...products, ...products, ...products];

  return (
    <section className="relative w-full py-16 bg-neutral-900 overflow-hidden flex flex-col justify-center border-b border-neutral-800">
      
      {/* Banner Text Headers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center mb-10 z-10 space-y-3">
        <span className="px-3.5 py-1.5 rounded-full border border-neutral-700 bg-neutral-850/50 backdrop-blur-md text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
          Exclusive Highlights
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Trending Now
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          Explore the most wanted additions, updated hourly. Hover to explore, click to inspect.
        </p>
      </div>

      {/* Infinite Horizontal Carousel (Marquee Container) */}
      <div className="relative w-full flex items-center overflow-x-hidden py-4 z-10">
        
        {/* Shadow Overlays to blend edges */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-neutral-900 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-neutral-900 to-transparent z-20 pointer-events-none" />

        {/* CSS Scrolling Marquee */}
        <div className="flex gap-6 animate-marquee whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer">
          {duplicatedProducts.map((product, idx) => {
            const primaryImage = product.images[0]?.url || "/images/product-tee.jpg";
            return (
              <Link
                key={`${product.id}-${idx}`}
                href={`/products/${product.id}`}
                className="inline-block w-64 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-2xl overflow-hidden p-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 select-none group"
              >
                {/* Image Frame */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 mb-4">
                  <img
                    src={primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    draggable="false"
                  />
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-600 text-white shadow-sm">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {product.brand?.name || "NXTSTORE"}
                  </span>
                  <h3 className="font-bold text-sm text-white truncate group-hover:text-neutral-300 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-extrabold text-white">
                        ₹{product.offerPrice.toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-xxs text-neutral-500 line-through">
                          ₹{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tailwind & CSS Animation Styles */}
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-33.33% - 8px));
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .text-xxs {
          font-size: 0.65rem;
        }
      `}</style>
    </section>
  );
}
