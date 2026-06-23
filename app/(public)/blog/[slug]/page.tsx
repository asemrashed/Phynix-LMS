import { BlogPostView } from "@/components/blog-post-view"

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16">
      <BlogPostView slug={slug} />
    </main>
  )
}
