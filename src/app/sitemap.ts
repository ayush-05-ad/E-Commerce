import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  let products: { id: string; updatedAt: Date }[] = []
  let categories: { slug: string; updatedAt: Date }[] = []

  try {
    // Fetch dynamic routes
    products = await db.product.findMany({
      where: { isArchived: false },
      select: { id: true, updatedAt: true },
    })

    categories = await db.category.findMany({
      select: { slug: true, updatedAt: true },
    })
  } catch (error) {
    console.warn('Warning: Database connection failed during sitemap generation. Falling back to static routes.', error)
  }

  // Static routes
  const routes = [
    '',
    '/about',
    '/contact',
    '/products',
    '/cart',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Category routes
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...routes, ...productRoutes, ...categoryRoutes]
}
