"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { api } from "@/lib/api"
import type { AdminCourseItem, PaginatedResult } from "@fxprime/types"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface AdminCourseSelectProps {
  value: string
  onChange: (courseId: string) => void
  label?: string
  publishedOnly?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function AdminCourseSelect({
  value,
  onChange,
  label,
  publishedOnly = true,
  placeholder = "Select course…",
  disabled = false,
  className,
}: AdminCourseSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [courses, setCourses] = useState<AdminCourseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState(label ?? "")

  useEffect(() => {
    if (label) setSelectedLabel(label)
  }, [label])

  const loadCourses = useCallback(
    async (query: string) => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set("page", "1")
        params.set("pageSize", "20")
        if (publishedOnly) params.set("status", "PUBLISHED")
        if (query.trim()) params.set("search", query.trim())
        const data = await api<PaginatedResult<AdminCourseItem>>(
          `/admin/courses?${params.toString()}`
        )
        setCourses(data.items)
      } catch {
        setCourses([])
      } finally {
        setLoading(false)
      }
    },
    [publishedOnly]
  )

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => loadCourses(search), 250)
    return () => clearTimeout(timer)
  }, [search, open, loadCourses])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between rounded-xl font-normal", className)}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search courses…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : "No courses found."}</CommandEmpty>
            <CommandGroup>
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={course.id}
                  onSelect={() => {
                    onChange(course.id)
                    setSelectedLabel(course.title)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === course.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {course.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
