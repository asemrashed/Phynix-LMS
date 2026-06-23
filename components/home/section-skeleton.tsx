import { LandingContainer } from "@/components/home/landing-container"
import { cn } from "@/lib/utils"

export function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("py-20", className)}>
      <LandingContainer>
        <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-[20px] bg-muted" />
          ))}
        </div>
      </LandingContainer>
    </div>
  )
}
