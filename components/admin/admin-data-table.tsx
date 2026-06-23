"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface AdminColumn<T> {
  key: string
  header: string
  className?: string
  cell: (row: T) => ReactNode
}

export interface AdminDataTableProps<T> {
  columns: AdminColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  actions?: (row: T) => ReactNode
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function AdminDataTable<T>({
  columns,
  data,
  rowKey,
  actions,
  loading = false,
  emptyMessage = "No items found.",
  className,
}: AdminDataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className={cn("overflow-hidden rounded-[20px] bg-card shadow-sm", className)}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
            {actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((col) => (
                <TableCell key={col.key} className={cn("align-middle", col.className)}>
                  {col.cell(row)}
                </TableCell>
              ))}
              {actions && (
                <TableCell className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">{actions(row)}</div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export interface AdminPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
