import { cn } from "@/lib/utils"

export function LandingContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4", className)} {...props} />
}
