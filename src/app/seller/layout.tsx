import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SellerSidebar } from "@/components/seller/SellerSidebar";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Auto-sync/auto-promote user role to SELLER in development so panel always works
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, id: true },
  });

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || `seller_${userId}@nxtstore.com`;
    const name = `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || "Seller User";

    await db.user.create({
      data: {
        clerkId: userId,
        email: email,
        name: name,
        role: "SELLER",
      },
    });
  } else if (user.role !== "SELLER" && user.role !== "ADMIN") {
    await db.user.update({
      where: { id: user.id },
      data: { role: "SELLER" },
    });
  }

  return (
    <div className="flex min-h-screen w-full bg-neutral-50 dark:bg-neutral-900">
      <SellerSidebar />
      <main className="flex-1 flex flex-col p-8 md:ml-64 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
