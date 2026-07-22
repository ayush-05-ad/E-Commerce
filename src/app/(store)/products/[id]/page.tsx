import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductDetailsClient } from "@/components/shop/ProductDetailsClient";

export const revalidate = 0; // Ensure fresh data on product details page

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Query product details from database
  const product = await db.product.findUnique({
    where: {
      id: id,
    },
    include: {
      images: true,
      variants: true,
      category: true,
      brand: true,
    },
  });

  if (!product || product.isArchived) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-950/50 py-12">
      <ProductDetailsClient product={product} />
    </div>
  );
}
