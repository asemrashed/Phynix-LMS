"use client"

import { useState } from "react"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ReorderableStringListProps {
  items: string[]
  onChange: (items: string[]) => void
  onRemove: (index: number) => void
  placeholder?: string
  inputClassName?: string
}

export function ReorderableStringList({
  items,
  onChange,
  onRemove,
  placeholder,
  inputClassName,
}: ReorderableStringListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const updateItem = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)))
  }

  const handleDrop = (targetIndex: number) => {
    if (dragIndex == null || dragIndex === targetIndex) {
      setDragIndex(null)
      return
    }
    const next = [...items]
    const [moved] = next.splice(dragIndex, 1)
    next.splice(targetIndex, 0, moved)
    onChange(next)
    setDragIndex(null)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className={cn(
            "flex items-center gap-2",
            dragIndex === index && "opacity-60"
          )}
        >
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
          <Input
            className={cn("rounded-xl", inputClassName)}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(index)}
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
