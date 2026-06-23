"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface AdminListFilterOption {
  value: string
  label: string
}

export interface AdminListFilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: AdminListFilterOption[]
  placeholder?: string
  className?: string
}

export function AdminListFilterSelect({
  value,
  onChange,
  options,
  placeholder = "Filter",
  className,
}: AdminListFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[160px] rounded-xl", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
