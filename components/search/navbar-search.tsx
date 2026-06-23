"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface NavbarSearchProps {
  className?: string
  fullWidth?: boolean
  onNavigate?: () => void
}

export function NavbarSearch({ className, fullWidth, onNavigate }: NavbarSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    onNavigate?.()
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, blog, products..."
          className={fullWidth ? "w-full bg-white pl-9" : "w-64 border-none bg-white pl-9 focus-visible:ring-primary"}
        />
      </div>
    </form>
  )
}
