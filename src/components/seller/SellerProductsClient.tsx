"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package, Trash2, Plus, X, Loader2, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { createProduct, deleteProduct, updateVariantStock } from "@/actions/product.actions";

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
}

interface Brand {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  originalPrice: number;
  offerPrice: number;
  discount: number;
  category: Category;
  brand: Brand | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

interface SellerProductsClientProps {
  storeId: string;
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
}

export function SellerProductsClient({
  storeId,
  initialProducts,
  categories,
  brands,
}: SellerProductsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);

  // Expandable row state
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const toggleExpand = (productId: string) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [brandId, setBrandId] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>(["/images/apparel-1.jpg"]);
  
  // Variant form states
  const [sku, setSku] = useState("");
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Slate Gray");
  const [stock, setStock] = useState("50");
  
  const [formError, setFormError] = useState("");

  const handleDelete = (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      } else {
        alert(res.error || "Failed to delete product.");
      }
    });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !description || !originalPrice || !offerPrice || !sku || !stock) {
      setFormError("All fields are required.");
      return;
    }

    const origPriceNum = parseFloat(originalPrice);
    const offPriceNum = parseFloat(offerPrice);
    const stockNum = parseInt(stock);

    if (isNaN(origPriceNum) || isNaN(offPriceNum) || isNaN(stockNum)) {
      setFormError("Price and stock details must be valid numbers.");
      return;
    }

    const filteredImages = imageUrls.filter((url) => url.trim() !== "");
    if (filteredImages.length === 0) {
      setFormError("At least one product image is required.");
      return;
    }

    startTransition(async () => {
      const res = await createProduct({
        storeId,
        name,
        description,
        originalPrice: origPriceNum,
        offerPrice: offPriceNum,
        categoryId,
        brandId: brandId || null,
        isFeatured: false,
        isArchived: false,
        images: filteredImages.map((url, index) => ({
          url: url.trim(),
          isPrimary: index === 0,
        })),
        variants: [
          {
            sku,
            size: size || undefined,
            color: color || undefined,
            stock: stockNum,
          },
        ],
      });

      if (res.success && res.product) {
        // Optimistic refresh
        setProducts((prev) => [res.product as Product, ...prev]);
        setIsOpen(false);
        // Reset form
        setName("");
        setDescription("");
        setOriginalPrice("");
        setOfferPrice("");
        setSku("");
        setStock("50");
        setImageUrls(["/images/apparel-1.jpg"]);
      } else {
        setFormError(res.error || "Failed to create product.");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Catalog Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Display, add, and remove products currently on showcase.
          </p>
        </div>
        <button
          onClick={() => {
            setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
            setIsOpen(true);
          }}
          className="px-5 py-3 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] transition-transform flex items-center gap-2 shadow-xl shadow-neutral-900/10"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Product List Table */}
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-12 text-center flex flex-col items-center justify-center gap-4">
          <Package className="w-12 h-12 text-neutral-400" />
          <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">No products found</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Your catalog is currently empty. Click the &apos;Add Product&apos; button above to create your first listing!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-8"></th>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Variants Stock</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  const isExpanded = expandedProductId === product.id;

                  return (
                    <tr key={product.id}>
                      <td colSpan={6} className="p-0">
                        <table className="w-full text-xs text-left border-collapse">
                          <tbody>
                            <tr 
                              className={`border-b border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50/20 dark:hover:bg-neutral-900/20 cursor-pointer ${
                                isExpanded ? "bg-neutral-50/10 dark:bg-neutral-900/10" : ""
                              }`}
                              onClick={() => toggleExpand(product.id)}
                            >
                              <td className="py-4 px-6 w-8 text-center">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-450" /> : <ChevronDown className="w-4 h-4 text-neutral-450" />}
                              </td>
                              <td className="py-4 px-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border bg-neutral-100 flex-shrink-0">
                                  <img src={primaryImg?.url || "/images/apparel-1.jpg"} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate max-w-xs">{product.name}</h4>
                                  <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">{product.brand?.name || "No Brand"}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 font-semibold text-neutral-600 dark:text-neutral-300">
                                {product.category.name}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-neutral-900 dark:text-white">₹{product.offerPrice.toFixed(2)}</span>
                                  {product.discount > 0 && (
                                    <span className="text-neutral-450 text-[10px] line-through">₹{product.originalPrice.toFixed(2)}</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                  totalStock === 0 ? "bg-red-500/10 text-red-500" :
                                  totalStock < 10 ? "bg-amber-500/10 text-amber-500" :
                                  "bg-neutral-100 dark:bg-neutral-900 text-neutral-500"
                                }`}>
                                  {totalStock} units
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  disabled={isPending}
                                  onClick={() => handleDelete(product.id)}
                                  className="p-2 rounded-xl text-neutral-450 hover:text-red-600 dark:hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50 inline-block"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-neutral-50/50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-900 animate-in fade-in duration-300">
                                <td colSpan={6} className="py-6 px-12 space-y-4">
                                  <div className="max-w-2xl">
                                    <h4 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-wider mb-3">Edit Variant Stocks</h4>
                                    <div className="space-y-3">
                                      {product.variants.map((v) => (
                                        <VariantStockRow key={v.id} variant={v} productId={product.id} setProducts={setProducts} />
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product slideover modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-150 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-neutral-900 dark:text-white" />
                <h2 className="font-extrabold text-lg text-neutral-900 dark:text-white">Create New Product</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateProduct} className="p-6 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
              {formError && (
                <div className="p-3 text-red-600 bg-red-50 border border-red-100 rounded-xl font-bold">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-neutral-400 uppercase tracking-wider">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Premium Leather Bag"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed layout of product features, stitching, materials..."
                  rows={3}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="99.00"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Offer Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder="79.00"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Brand</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                  >
                    <option value="">No Brand (Generic)</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider">Product Pictures</label>
                  <button
                    type="button"
                    onClick={() => setImageUrls((prev) => [...prev, ""])}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold underline"
                  >
                    + Add Another Pic
                  </button>
                </div>
                <div className="space-y-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => {
                          const updated = [...imageUrls];
                          updated[index] = e.target.value;
                          setImageUrls(updated);
                        }}
                        placeholder={
                          index === 0
                            ? "/images/apparel-1.jpg (Primary Image)"
                            : `/images/apparel-2.jpg (Additional Image ${index})`
                        }
                        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageUrls((prev) => prev.filter((_, i) => i !== index));
                          }}
                          className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-shrink-0 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Specify relative local paths or custom web URLs. The first image will automatically be set as primary.
                </p>
              </div>

              {/* Variant Specs */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
                <h4 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-wider">Initial Variant Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="SKU-XXX-XXX"
                      className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider">Stock Count</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="50"
                      className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider">Size Option</label>
                    <input
                      type="text"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="M, XL or One Size"
                      className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider">Color Option</label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Slate Gray or Noir Black"
                      className="w-full bg-neutral-55 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
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
                      <Check className="w-4 h-4" /> Save Product
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

function VariantStockRow({ 
  variant, 
  productId,
  setProducts 
}: { 
  variant: any; 
  productId: string;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>
}) {
  const [stockVal, setStockVal] = useState(variant.stock.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const handleSave = async () => {
    const num = parseInt(stockVal);
    if (isNaN(num) || num < 0) {
      alert("Please enter a valid stock number.");
      return;
    }
    
    setIsSaving(true);
    const res = await updateVariantStock(variant.id, num);
    setIsSaving(false);

    if (res.success) {
      setProducts((prev) => 
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              variants: p.variants.map((v: any) => 
                v.id === variant.id ? { ...v, stock: num } : v
              )
            };
          }
          return p;
        })
      );
      setShowCheck(true);
      setTimeout(() => setShowCheck(false), 2000);
    } else {
      alert(res.error || "Failed to update variant stock.");
    }
  };

  return (
    <div className="flex items-center justify-between text-xs border-b border-neutral-100 dark:border-neutral-850 pb-2 last:border-0 last:pb-0">
      <div className="font-semibold text-neutral-700 dark:text-neutral-350">
        SKU: <span className="font-bold text-neutral-900 dark:text-white">{variant.sku}</span> 
        {variant.size && <span className="ml-2 font-bold bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded text-[10px] uppercase">Size: {variant.size}</span>}
        {variant.color && <span className="ml-2 font-bold bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5 rounded text-[10px] uppercase">Color: {variant.color}</span>}
      </div>
      
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <input
          type="number"
          min="0"
          value={stockVal}
          onChange={(e) => setStockVal(e.target.value)}
          className="w-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-lg px-2.5 py-1 text-center font-bold text-neutral-900 dark:text-white text-[10px] focus:outline-none"
        />
        <button
          disabled={isSaving}
          onClick={handleSave}
          className="px-3 py-1 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : showCheck ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}
