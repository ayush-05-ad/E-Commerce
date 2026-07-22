import { db } from "@/lib/db";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const revalidate = 0; // Disable static caching so modifications are visible immediately

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const categoryId = resolvedParams.category;
  const searchQuery = resolvedParams.search;

  // Build dynamic database query filters
  const where: any = {
    isArchived: false,
  };

  if (categoryId) {
    where.category = {
      OR: [
        { id: categoryId },
        { slug: categoryId },
      ]
    };
  }

  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  // Fetch active products with images, variants, category, and brand details
  const products = await db.product.findMany({
    where,
    include: {
      images: true,
      variants: true,
      category: true,
      brand: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all categories for filter options
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Page Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Catalog
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Explore our curated selection of high-quality products.
            </p>
          </div>
          <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500 mt-2 md:mt-0">
            Showing {products.length} products
          </span>
        </div>

        {/* Product Grid & Sidebar Filters */}
        <ProductGrid initialProducts={products} categories={categories} />
        
      </div>
    </div>
  );
}
