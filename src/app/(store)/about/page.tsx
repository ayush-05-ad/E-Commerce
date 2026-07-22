import { Award, Compass, ShieldCheck, Heart } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: <Compass className="w-8 h-8 text-neutral-800 dark:text-neutral-200" />,
      title: "Our Vision",
      description: "To elevate modern daily lifestyle aesthetics by introducing meticulously curated design structures, pairing high fidelity with timeless style.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-neutral-800 dark:text-neutral-200" />,
      title: "Uncompromising Quality",
      description: "Every item in our storefront is handpicked and source-verified. From organic fibers in apparel to precision-tuned drivers in acoustic gadgets.",
    },
    {
      icon: <Award className="w-8 h-8 text-neutral-800 dark:text-neutral-200" />,
      title: "Craftsmanship First",
      description: "We partner with dedicated designers, artists, and independent vendors who value durable stitching, luxury materials, and sustainable silhouettes.",
    },
    {
      icon: <Heart className="w-8 h-8 text-neutral-800 dark:text-neutral-200" />,
      title: "Eco-Friendly Legacy",
      description: "Committed to circular fashion, reducing cardboard packaging waistlines, and creating products that last for generations instead of seasons.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16 mt-8">
        
        {/* Banner Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-neutral-200 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-500 uppercase tracking-widest">
            Aesthetic Heritage
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tight">
            Designed for the <br /> Modern Lifestyle.
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
            NXTSTORE is a curated multi-vendor marketplace built to serve premium products, luxury fashion garments, and hardware-accelerated tech devices directly to style pioneers.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {values.map((val, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/80 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all space-y-4"
            >
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 rounded-2xl w-fit">
                {val.icon}
              </div>
              <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                {val.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                {val.description}
              </p>
            </div>
          ))}
        </div>

        {/* Contact/Action Box */}
        <div className="p-8 md:p-12 rounded-3xl bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-transparent pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-black tracking-tight z-10">
            Define Your Style. Shop the Catalog.
          </h2>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-md mx-auto z-10 font-medium">
            Join the community of modern collectors. Discover design-focused items sourced globally for you.
          </p>
          <div className="pt-2 z-10">
            <a 
              href="/shop"
              className="px-8 py-3.5 rounded-full bg-white dark:bg-neutral-950 text-neutral-950 dark:text-white font-bold text-xs uppercase tracking-wider inline-block hover:scale-105 transition-transform"
            >
              Explore Products
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
