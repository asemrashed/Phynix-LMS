import type { ReactNode } from "react"

interface LegalPageLayoutProps {
  title: string
  description?: string
  children: ReactNode
}

export function LegalPageLayout({ title, description, children }: LegalPageLayoutProps) {
  return (
    <main>
      <div className="border-b border-border/60 bg-gradient-to-b from-primary/[0.04] via-background to-background">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
          {description && (
            <p className="mt-3 max-w-3xl text-base text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-[20px] border border-border/60 bg-card p-6 shadow-sm md:p-10">
          <div className="prose prose-neutral max-w-none text-foreground dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-xl prose-p:text-muted-foreground prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
