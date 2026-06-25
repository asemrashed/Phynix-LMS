import { BlogListing } from "@/components/blog/blog-listing"

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Blog & Market Analysis
          </h1>
          <p className="mt-4 text-muted-foreground">
            English education articles, study tips, and exam strategies
          </p>
        </div>
        <BlogListing />
    </main>
  )
}
