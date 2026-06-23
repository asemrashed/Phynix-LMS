"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface AdminListSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  debounceMs?: number
}

export function AdminListSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
  inputClassName,
  debounceMs = 300,
}: AdminListSearchProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draft !== value) onChange(draft)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [draft, value, onChange, debounceMs])

  return (
    <div className={cn("relative max-w-sm", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className={cn("rounded-xl pl-9", inputClassName)}
      />
    </div>
  )
}
