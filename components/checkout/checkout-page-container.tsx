import { cn } from "@/lib/utils"

export function CheckoutPageContainer({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 py-12", className)}>{children}</div>
  )
}
