"use client"

import { useState } from "react"
import Link from "next/link"
import { FileDown, Package, Plus } from "lucide-react"
import { api } from "@/lib/api"
import type { AdminProductItem } from "@fxprime/types"
import { AdminListPagination } from "@/components/admin/admin-list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAdminPaginatedList } from "@/hooks/use-admin-paginated-list"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const TAB_CONFIG = {
  digital: {
    label: "Digital",
    description: "Ebooks, PDFs, journals & downloadable resources",
    icon: FileDown,
    activeTrigger:
      "data-[state=active]:border-blue-200 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:border-blue-800 dark:data-[state=active]:bg-blue-950/50 dark:data-[state=active]:text-blue-300",
    countBadge:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    newButton: "bg-blue-600 text-white hover:bg-blue-700",
  },
  physical: {
    label: "Physical",
    description: "Notebook, merch & shipped study products",
    icon: Package,
    activeTrigger:
      "data-[state=active]:border-amber-200 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-800 data-[state=active]:shadow-sm dark:data-[state=active]:border-amber-800 dark:data-[state=active]:bg-amber-950/50 dark:data-[state=active]:text-amber-300",
    countBadge:
      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    newButton: "bg-amber-600 text-white hover:bg-amber-700",
  },
} as const

function DigitalProductRow({
  product,
  onToggle,
}: {
  product: AdminProductItem
  onToggle: (product: AdminProductItem) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{product.title}</p>
        <p className="text-sm text-muted-foreground">
          {product.type} · ৳{product.price.toLocaleString()} · /{product.slug}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{product.isActive ? "Active" : "Inactive"}</Badge>
        <Link href={`/admin/products/digital/${product.id}`}>
          <Button size="sm" variant="outline" className="rounded-xl">
            Edit
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => onToggle(product)}
        >
          {product.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  )
}

function PhysicalProductRow({
  product,
  onToggle,
}: {
  product: AdminProductItem
  onToggle: (product: AdminProductItem) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{product.name}</p>
        <p className="text-sm text-muted-foreground">
          ৳{product.price} · Stock: {product.stock} · /{product.slug}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{product.isActive ? "Active" : "Inactive"}</Badge>
        <Link href={`/admin/products/physical/${product.id}`}>
          <Button size="sm" variant="outline" className="rounded-xl">
            Edit
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={() => onToggle(product)}
        >
          {product.isActive ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<"digital" | "physical">("digital")
  const digital = useAdminPaginatedList<AdminProductItem>("/admin/products/digital")
  const physical = useAdminPaginatedList<AdminProductItem>("/admin/products/physical")

  const reloadProducts = () => {
    digital.refetch()
    physical.refetch()
  }

  const toggleDigital = async (product: AdminProductItem) => {
    try {
      await api(`/admin/products/digital/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      reloadProducts()
      toast.success(product.isActive ? "Product deactivated" : "Product activated")
    } catch {
      toast.error("Failed to update product")
    }
  }

  const togglePhysical = async (product: AdminProductItem) => {
    try {
      await api(`/admin/products/physical/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      reloadProducts()
      toast.success(product.isActive ? "Product deactivated" : "Product activated")
    } catch {
      toast.error("Failed to update product")
    }
  }

  const activeConfig = TAB_CONFIG[activeTab]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage digital downloads and physical store items
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" className="rounded-xl">
            Back
          </Button>
        </Link>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "digital" | "physical")}
      >
        <div className="mb-6 rounded-[20px] border border-border/70 bg-card p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl bg-muted/50 p-1.5 sm:max-w-md">
              {(Object.keys(TAB_CONFIG) as Array<keyof typeof TAB_CONFIG>).map((key) => {
                const config = TAB_CONFIG[key]
                const count = key === "digital" ? digital.total : physical.total
                const Icon = config.icon

                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all",
                      "hover:bg-background/60 hover:text-foreground",
                      config.activeTrigger
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{config.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                        config.countBadge
                      )}
                    >
                      {count}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
              <p className="text-sm text-muted-foreground lg:max-w-xs lg:text-right">
                {activeConfig.description}
              </p>
              {activeTab === "digital" ? (
                <Link href="/admin/products/digital/new" className="shrink-0">
                  <Button size="sm" className={cn("rounded-xl", activeConfig.newButton)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Digital
                  </Button>
                </Link>
              ) : (
                <Link href="/admin/products/physical/new" className="shrink-0">
                  <Button size="sm" className={cn("rounded-xl", activeConfig.newButton)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    New Physical
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        <TabsContent value="digital" className="mt-0 space-y-3">
          {digital.loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              {digital.items.map((product) => (
                <DigitalProductRow key={product.id} product={product} onToggle={toggleDigital} />
              ))}
              {digital.items.length === 0 && (
                <p className="text-sm text-muted-foreground">No digital products yet.</p>
              )}
              <AdminListPagination
                page={digital.page}
                pageSize={digital.pageSize}
                total={digital.total}
                onPageChange={digital.setPage}
                onPageSizeChange={digital.setPageSize}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="physical" className="mt-0 space-y-3">
          {physical.loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              {physical.items.map((product) => (
                <PhysicalProductRow key={product.id} product={product} onToggle={togglePhysical} />
              ))}
              {physical.items.length === 0 && (
                <p className="text-sm text-muted-foreground">No physical products yet.</p>
              )}
              <AdminListPagination
                page={physical.page}
                pageSize={physical.pageSize}
                total={physical.total}
                onPageChange={physical.setPage}
                onPageSizeChange={physical.setPageSize}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
