import type { MetadataRoute } from "next"
import { fetchServerApi } from "@/lib/api-url"
import { getSiteUrl } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/courses",
    "/marketplace",
    "/blog",
    "/live",
    "/pricing",
    "/search",
    "/cart",
  ].map((path) => ({
    url: `${site}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }))

  const [coursesData, blogData, marketplaceData] = await Promise.all([
    fetchServerApi<{ courses: { slug: string; updatedAt?: string }[] }>("/courses?limit=100"),
    fetchServerApi<{ posts: { slug: string; publishedAt: string | null }[] }>("/blog?limit=100"),
    fetchServerApi<{ products: { slug: string; productType: string }[] }>(
      "/products/marketplace"
    ),
  ])

  const courseRoutes: MetadataRoute.Sitemap =
    coursesData?.courses.map((c) => ({
      url: `${site}/courses/${c.slug}`,
      lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    })) ?? []

  const blogRoutes: MetadataRoute.Sitemap =
    blogData?.posts.map((p) => ({
      url: `${site}/blog/${p.slug}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    })) ?? []

  const productRoutes: MetadataRoute.Sitemap =
    marketplaceData?.products.map((p) => ({
      url: `${site}/marketplace/${p.productType}/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    })) ?? []

  return [...staticRoutes, ...courseRoutes, ...blogRoutes, ...productRoutes]
}
