import { db } from "@/lib/db";
import { CheckoutClient } from "@/components/shop/CheckoutClient";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const revalidate = 0;

interface CheckoutPageProps {
  searchParams: Promise<{
    productId?: string;
    quantity?: string;
    size?: string;
    color?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const productId = params.productId;
  const quantity = parseInt(params.quantity || "1");
  const size = params.size;
  const color = params.color;

  let singleProduct = null;

  if (productId) {
    singleProduct = await db.product.findUnique({
      where: { id: productId },
      include: { brand: true, images: true },
    });
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <CheckoutClient
        singleProduct={singleProduct}
        singleProductDetails={{
          quantity,
          size: size || null,
          color: color || null,
        }}
      />
    </div>
  );
}
