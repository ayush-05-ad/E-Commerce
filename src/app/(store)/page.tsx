import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { MovingBanner } from "@/components/shared/MovingBanner";

const categoryImages: Record<string, string> = {
  apparel: "/images/category-apparel.jpg",
  tech: "/images/category-tech.jpg",
  accessories: "/images/category-accessories.jpg",
};

export default async function StorefrontHomePage() {
  // Fetch featured products for the marquee banner
  const featuredProducts = await db.product.findMany({
    where: {
      isFeatured: true,
      isArchived: false,
    },
    include: {
      images: true,
      brand: true,
    },
    take: 12,
  });

  const categories = await db.category.findMany();

  // Fetch trending/new arrivals
  const trendingProducts = await db.product.findMany({
    where: { isArchived: false },
    include: {
      images: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="w-full bg-neutral-50/30 dark:bg-neutral-950/30">
      {/* Premium Cinematic Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center bg-black">
        {/* Full-bleed background image with scale/opacity fade */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/storefront_hero.png" 
            alt="Premium Storefront Showcase"
            className="w-full h-full object-cover opacity-75 object-center transform scale-105 animate-pulse-subtle"
          />
          {/* Multi-layered premium vignette overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10" />
        </div>
        
        <div className="relative z-20 text-left px-6 sm:px-12 lg:px-24 max-w-4xl space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] font-bold text-neutral-300 tracking-widest uppercase">
            New Collection 2026
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
            Elevate Your Style. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-400">
              Define Your Legacy.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl font-medium leading-relaxed">
            Discover our latest arrivals designed for the modern lifestyle. Sourced from premium organic fibers and high-res balance acoustics.
          </p>
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Link 
              href="/shop" 
              className="px-8 py-4 rounded-full bg-white text-neutral-900 font-bold hover:bg-neutral-200 hover:scale-105 transition-all text-xs tracking-wider uppercase shadow-xl"
            >
              Shop Collection
            </Link>
            <Link 
              href="/shop?category=tech" 
              className="px-8 py-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold hover:bg-white/10 hover:scale-105 transition-all text-xs tracking-wider uppercase"
            >
              Explore Tech
            </Link>
          </div>
        </div>
      </section>
      
      {/* Subtle animation helper stylesheet */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulseSubtle {
          0%, 100% { opacity: 0.70; transform: scale(1.03); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
        .animate-pulse-subtle {
          animation: pulseSubtle 12s ease-in-out infinite;
        }
      `}} />

      {/* Infinite Horizontal Cards Marquee */}
      {featuredProducts.length > 0 && (
        <MovingBanner products={featuredProducts} />
      )}

      {/* Featured Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase">Featured Categories</h2>
            <p className="text-xs text-neutral-400 mt-1 font-medium">Explore premium options grouped by lifestyle divisions.</p>
          </div>
          <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline">
            View All Categories
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const imageUrl = categoryImages[category.slug] || "/images/category-accessories.jpg";
            return (
              <Link 
                key={category.id}
                href={`/shop?category=${category.id}`}
                className="group relative h-[450px] rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 cursor-pointer block shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border border-neutral-200/40 dark:border-neutral-800/40"
              >
                <img 
                  src={imageUrl} 
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/0 z-20" />
                
                <div className="absolute bottom-0 left-0 p-8 z-30 space-y-2">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/10 border border-white/20 text-neutral-200 uppercase tracking-widest backdrop-blur-sm">
                    Collection
                  </span>
                  <h3 className="text-3xl font-black text-white tracking-tight">{category.name}</h3>
                  <span className="text-white/80 text-xs font-bold flex items-center gap-1 group-hover:gap-3 transition-all uppercase tracking-wider">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* New Arrivals Section */}
      {trendingProducts.length > 0 && (
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white uppercase">New Arrivals</h2>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Sought-after silhouettes curated for this season.</p>
            </div>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors underline">
              Browse All Products
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {trendingProducts.map((product) => {
              const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
              return (
                <Link 
                  key={product.id} 
                  href={`/products/${product.id}`}
                  className="group flex flex-col bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Product Card Image */}
                  <div className="aspect-square w-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden relative border-b border-neutral-105 dark:border-neutral-900">
                    <img 
                      src={primaryImg?.url || "/images/apparel-1.jpg"} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                        -{product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                        {product.category.name}
                      </span>
                      <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white mt-1 group-hover:text-emerald-500 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-2 pt-2 border-t border-neutral-50 dark:border-neutral-850">
                      <span className="font-black text-sm text-neutral-900 dark:text-white">
                        ${product.offerPrice.toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <span className="text-neutral-450 text-[10px] line-through font-medium">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Define Your Legacy Campaign Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          
          {/* Subtle glowing ambient lighting */}
          <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

          {/* Left Text details */}
          <div className="space-y-6 max-w-lg z-10">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              Heritage Series
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              A Legacy of <br /> Uncompromised Quality.
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              Hand-finished accessories crafted for those who style their path. Featuring full-grain vegetable tanned leathers, brass YKK zipper layouts, and time-tested silhouettes.
            </p>
            <div className="pt-2">
              <Link 
                href="/shop?category=accessories"
                className="px-6 py-3 rounded-full bg-white text-neutral-950 font-bold hover:bg-neutral-200 transition-colors text-xs uppercase tracking-wider inline-block"
              >
                Shop Heritage Collection
              </Link>
            </div>
          </div>

          {/* Right Banner Image */}
          <div className="relative w-full md:w-[45%] aspect-[4/3] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-lg z-10 flex-shrink-0">
            <img 
              src="/images/define_your_legacy.png" 
              alt="Legacy Leather Accessories Campaign"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

        </div>
      </section>
    </div>
  );
}
