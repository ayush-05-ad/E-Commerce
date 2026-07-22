"use client";

import { useState } from "react";
import { Image as ImageIcon, Copy, Check, Info } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  product: { name: string };
}

interface SellerMediaClientProps {
  initialImages: ProductImage[];
}

export function SellerMediaClient({ initialImages }: SellerMediaClientProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fallback local image list that sellers can use to copy-paste URLs in form
  const localImageLibrary = [
    { url: "/images/apparel-1.jpg", name: "Classic Cotton Tee" },
    { url: "/images/apparel-2.jpg", name: "Premium Knit Crew" },
    { url: "/images/apparel-3.jpg", name: "Heritage Canvas Jacket" },
    { url: "/images/apparel-4.jpg", name: "Chore Utility Coat" },
    { url: "/images/tech-1.jpg", name: "Chronos Smart Watch" },
    { url: "/images/tech-2.jpg", name: "Acoustic Over-Ear ANC" },
    { url: "/images/tech-3.jpg", name: "Vibe Wireless Buds" },
    { url: "/images/acc-1.jpg", name: "Vintage Leather Wallet" },
    { url: "/images/acc-2.jpg", name: "Classic Brass Watch" },
    { url: "/images/acc-3.jpg", name: "Modern Leather Belt" },
    { url: "/images/define_your_legacy.png", name: "Legacy Lifestyle Banner" },
  ];

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
          <ImageIcon className="w-8 h-8 text-neutral-500" /> Media Library
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Browse loaded product assets and local storage URL references.
        </p>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl p-4 flex gap-3 text-xs leading-relaxed font-semibold">
        <Info className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
        <p className="text-neutral-350">
          Use the local image assets listed below when creating or editing products in the form. Copy any image path and paste it directly into the product creation &apos;Image Asset URL&apos; field.
        </p>
      </div>

      {/* Active Catalog Images */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-neutral-900 dark:text-white uppercase tracking-wider">Active Catalog Images</h3>
        {initialImages.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No products added yet, showing local stock image library below instead.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {initialImages.map((img) => (
              <div key={img.id} className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                  <img src={img.url} alt={img.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-3 space-y-1.5 text-xxs">
                  <p className="font-bold text-neutral-900 dark:text-white truncate">{img.product.name}</p>
                  <button
                    onClick={() => handleCopy(img.id, img.url)}
                    className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 rounded-lg text-neutral-600 dark:text-neutral-300 font-bold transition-colors uppercase tracking-wider"
                  >
                    {copiedId === img.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Path
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Local Asset Gallery */}
      <div className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 pt-8">
        <h3 className="font-extrabold text-base text-neutral-900 dark:text-white uppercase tracking-wider">Local Stocks Library</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {localImageLibrary.map((img) => (
            <div key={img.url} className="group relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3 space-y-1.5 text-xxs">
                <p className="font-bold text-neutral-900 dark:text-white truncate">{img.name}</p>
                <button
                  onClick={() => handleCopy(img.url, img.url)}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 rounded-lg text-neutral-600 dark:text-neutral-300 font-bold transition-colors uppercase tracking-wider"
                >
                  {copiedId === img.url ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                      </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Path
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
