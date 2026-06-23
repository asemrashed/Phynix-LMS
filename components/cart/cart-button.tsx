"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cart-store"
import { cn } from "@/lib/utils"

interface CartButtonProps {
  className?: string
}

export function CartButton({ className }: CartButtonProps) {
  const [mounted, setMounted] = useState(false)
  const count = useCartStore((s) => s.itemCount())

  useEffect(() => setMounted(true), [])

  return (
    <Link href="/cart">
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative rounded-xl", className)}
      >
        <ShoppingCart className="h-5 w-5" />
        {mounted && count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
    </Link>
  )
}
