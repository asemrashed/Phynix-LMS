import { BlogListing } from "@/components/blog/blog-listing"

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl capitalize">
            {slug.replace(/-/g, " ")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            Articles and analysis in this category
          </p>
        </div>
        <BlogListing categorySlug={slug} />
    </main>
  )
}
