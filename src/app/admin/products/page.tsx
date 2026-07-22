import { db } from "@/lib/db";
import { Package } from "lucide-react";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      store: { select: { name: true } },
      variants: { select: { stock: true } },
      images: { select: { url: true } },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 space-y-8">
        
        {/* Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Global Products List
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Browse and inspect all catalog listings published across all vendor storefronts.
          </p>
        </div>

        {/* Products Table */}
        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-12 text-center flex flex-col items-center justify-center gap-4">
            <Package className="w-12 h-12 text-neutral-400" />
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">No products found</h3>
            <p className="text-xs text-neutral-500 max-w-sm">
              There are no products listed on the platform yet.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Product details</th>
                    <th className="py-4 px-6">Store</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Total Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const primaryImg = product.images[0]?.url || "/images/apparel-1.jpg";
                    const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                    return (
                      <tr key={product.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/20">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border bg-neutral-100 flex-shrink-0">
                            <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-xs">{product.name}</h4>
                            <span className="text-[10px] text-neutral-400 block truncate max-w-xs">{product.description.slice(0, 50)}...</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-850 dark:text-neutral-200">
                          {product.store.name}
                        </td>
                        <td className="py-4 px-6 font-semibold text-neutral-600 dark:text-neutral-300">
                          {product.category.name}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 dark:text-white">${product.offerPrice.toFixed(2)}</span>
                            {product.discount > 0 && (
                              <span className="text-neutral-450 line-through">${product.originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            totalStock === 0 ? "bg-red-500/10 text-red-500" :
                            totalStock < 10 ? "bg-amber-500/10 text-amber-500" :
                            "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
                          }`}>
                            {totalStock} units
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
