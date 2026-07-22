import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up database...");
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.store.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding database with 50 products...");

  // 1. Create a mock seller user
  const seller = await prisma.user.create({
    data: {
      clerkId: "mock_clerk_seller_id",
      email: "seller@nxtstore.com",
      name: "Ayush Deep",
      role: "SELLER",
    },
  });

  // 2. Create a default store
  const store = await prisma.store.create({
    data: {
      name: "NXTSTORE Official",
      description: "The official store for premium curated products.",
      sellerId: seller.id,
      isActive: true,
    },
  });

  // 3. Create Categories
  const categoryApparel = await prisma.category.create({
    data: { name: "Apparel", slug: "apparel" },
  });
  const categoryTech = await prisma.category.create({
    data: { name: "Tech & Gadgets", slug: "tech" },
  });
  const categoryAccessories = await prisma.category.create({
    data: { name: "Accessories", slug: "accessories" },
  });

  // 4. Create Brands
  const brandAesthetic = await prisma.brand.create({
    data: { name: "Aesthetic Co." },
  });
  const brandVortek = await prisma.brand.create({
    data: { name: "Vortek Tech" },
  });
  const brandLegacy = await prisma.brand.create({
    data: { name: "Legacy Leather" },
  });

  // Helper to generate variants
  const getApparelVariants = (productName: string, index: number) => [
    { sku: `APP-S-${index}`, size: "S", color: "Slate Gray", stock: 10 + (index % 5) },
    { sku: `APP-M-${index}`, size: "M", color: "Slate Gray", stock: 15 + (index % 5) },
    { sku: `APP-L-${index}`, size: "L", color: "Slate Gray", stock: 12 + (index % 5) },
    { sku: `APP-XL-${index}`, size: "XL", color: "Slate Gray", stock: 8 + (index % 5) },
  ];

  const getTechVariants = (productName: string, index: number) => [
    { sku: `TECH-BLK-${index}`, size: "One Size", color: "Matte Black", stock: 5 + (index % 3) },
    { sku: `TECH-WHT-${index}`, size: "One Size", color: "Glacier White", stock: 8 + (index % 3) },
  ];

  const getAccessoriesVariants = (productName: string, index: number) => [
    { sku: `ACC-BRN-${index}`, size: "One Size", color: "Chestnut Brown", stock: 6 + (index % 4) },
    { sku: `ACC-BLK-${index}`, size: "One Size", color: "Noir Black", stock: 9 + (index % 4) },
  ];

  let productCount = 0;

  // 1. Generate 20 Apparel products
  for (let i = 1; i <= 20; i++) {
    productCount++;
    const originalPrice = 45 + (i * 3);
    const offerPrice = Math.round(originalPrice * 0.75); // 25% discount
    const discount = 25;

    // Cycling images to make each product unique
    const primaryImg = `/images/apparel-${(i % 8) + 1}.jpg`;
    const secImg = `/images/apparel-${((i + 1) % 8) + 1}.jpg`;
    const tertImg = `/images/apparel-${((i + 2) % 8) + 1}.jpg`;

    await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categoryApparel.id,
        brandId: brandAesthetic.id,
        name: `Aesthetic Comfort Tee v${i}`,
        description: `Premium heavyweight custom cut tee, volume ${i}. Tailored flatlock stitching with a thick rib collar for structured wear. Sourced from 100% organic long-staple cotton, pre-shrunk to retain shape.`,
        originalPrice,
        offerPrice,
        discount,
        isFeatured: i <= 3, // first 3 featured
        images: {
          create: [
            { url: primaryImg, isPrimary: true },
            { url: secImg, isPrimary: false },
            { url: tertImg, isPrimary: false },
          ],
        },
        variants: {
          create: getApparelVariants(`Aesthetic Comfort Tee v${i}`, i),
        },
      },
    });
  }

  // 2. Generate 15 Tech products
  for (let i = 1; i <= 15; i++) {
    productCount++;
    const originalPrice = 120 + (i * 12);
    const offerPrice = Math.round(originalPrice * 0.85); // 15% discount
    const discount = 15;

    // Cycling images
    const primaryImg = `/images/tech-${(i % 8) + 1}.jpg`;
    const secImg = `/images/tech-${((i + 1) % 8) + 1}.jpg`;
    const tertImg = `/images/tech-${((i + 2) % 8) + 1}.jpg`;

    await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categoryTech.id,
        brandId: brandVortek.id,
        name: `Vortek Smart Audio X${i}`,
        description: `Acoustic engineering version ${i}. Custom balanced armature drivers delivering hi-res audio, spatial awareness settings, and dynamic active noise cancellation. Features up to 35 hours of battery life with smart fast charge.`,
        originalPrice,
        offerPrice,
        discount,
        isFeatured: i <= 2,
        images: {
          create: [
            { url: primaryImg, isPrimary: true },
            { url: secImg, isPrimary: false },
            { url: tertImg, isPrimary: false },
          ],
        },
        variants: {
          create: getTechVariants(`Vortek Smart Audio X${i}`, i),
        },
      },
    });
  }

  // 3. Generate 15 Accessories products
  for (let i = 1; i <= 15; i++) {
    productCount++;
    const originalPrice = 80 + (i * 6);
    const offerPrice = Math.round(originalPrice * 0.8); // 20% discount
    const discount = 20;

    // Cycling images
    const primaryImg = `/images/acc-${(i % 8) + 1}.jpg`;
    const secImg = `/images/acc-${((i + 1) % 8) + 1}.jpg`;
    const tertImg = `/images/acc-${((i + 2) % 8) + 1}.jpg`;

    await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: categoryAccessories.id,
        brandId: brandLegacy.id,
        name: `Legacy Everyday Carry Bag v${i}`,
        description: `Handcrafted modular carry utility bag, series ${i}. Premium canvas lining inside and full-grain vegetable-tanned leather outside. Built with dual YKK brass zippers and multi-compartment layouts for efficient travel.`,
        originalPrice,
        offerPrice,
        discount,
        isFeatured: i <= 2,
        images: {
          create: [
            { url: primaryImg, isPrimary: true },
            { url: secImg, isPrimary: false },
            { url: tertImg, isPrimary: false },
          ],
        },
        variants: {
          create: getAccessoriesVariants(`Legacy Everyday Carry Bag v${i}`, i),
        },
      },
    });
  }

  console.log(`Seeding completed successfully! Created ${productCount} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
