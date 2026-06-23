"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { PanelNavGroup, PanelNavItem } from "@/lib/panel-nav"

interface PanelSidebarProps {
  nav: PanelNavGroup[]
  panelTitle: string
  persistKey?: string
  className?: string
  onNavigate?: () => void
}

function isExactPanelRoot(pathname: string, href: string) {
  return (
    href === "/dashboard" ||
    href === "/admin" ||
    href === "/instructor"
  )
}

function isNavItemActive(
  pathname: string,
  href: string,
  allHrefs: string[]
) {
  if (isExactPanelRoot(pathname, href)) {
    return pathname === href
  }

  const matches =
    pathname === href || pathname.startsWith(`${href}/`)
  if (!matches) return false

  const hasMoreSpecificMatch = allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(`${href}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`))
  )

  return !hasMoreSpecificMatch
}

function isGroupActive(pathname: string, items: PanelNavItem[], allHrefs: string[]) {
  return items.some((item) => isNavItemActive(pathname, item.href, allHrefs))
}

function readStoredOpenGroups(key: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as string[]
    return new Set(parsed)
  } catch {
    return null
  }
}

function writeStoredOpenGroups(key: string, open: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...open]))
  } catch {
    // ignore quota / private mode
  }
}

function NavLinkItem({
  item,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  item: PanelNavItem
  isActive: boolean
  isCollapsed: boolean
  onNavigate?: () => void
}) {
  const link = (
    <Link
      href={item.comingSoon ? "#" : item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        isCollapsed && "justify-center px-2",
        item.comingSoon && "pointer-events-none opacity-60"
      )}
      onClick={(e) => {
        if (item.comingSoon) e.preventDefault()
        else onNavigate?.()
      }}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.comingSoon && (
            <Badge variant="outline" className="text-[10px]">
              Soon
            </Badge>
          )}
        </>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

export function PanelSidebar({
  nav,
  panelTitle,
  persistKey,
  className,
  onNavigate,
}: PanelSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const storageKey = `panel-nav-groups:${persistKey ?? panelTitle}`
  const allHrefs = useMemo(
    () => nav.flatMap((group) => group.items.map((item) => item.href)),
    [nav]
  )

  const activeGroupNames = useMemo(
    () =>
      nav
        .filter((group) => isGroupActive(pathname, group.items, allHrefs))
        .map((group) => group.group),
    [nav, pathname, allHrefs]
  )

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const stored = readStoredOpenGroups(storageKey)
    if (stored) return stored
    return new Set(activeGroupNames)
  })

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      for (const name of activeGroupNames) {
        next.add(name)
      }
      return next
    })
  }, [activeGroupNames])

  const toggleGroup = useCallback(
    (groupName: string, open: boolean) => {
      setOpenGroups((prev) => {
        const next = new Set(prev)
        if (open) next.add(groupName)
        else next.delete(groupName)
        writeStoredOpenGroups(storageKey, next)
        return next
      })
    },
    [storageKey]
  )

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "sticky top-16 flex h-[calc(100vh-4rem)] w-64 flex-col border-r border-border bg-card transition-all duration-300",
        isCollapsed && "w-[4.5rem]",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-card shadow-sm"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {!isCollapsed && (
        <div className="border-b border-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {panelTitle}
          </p>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <nav className="p-3">
          <div className="space-y-2">
            {nav.map((group) => {
              const groupActive = isGroupActive(pathname, group.items, allHrefs)
              const isSingleItem = group.items.length === 1
              const isOpen = openGroups.has(group.group)

              if (isCollapsed) {
                return (
                  <div key={group.group} className="space-y-1">
                    {group.items.map((item) => (
                      <NavLinkItem
                        key={item.href}
                        item={item}
                        isActive={isNavItemActive(pathname, item.href, allHrefs)}
                        isCollapsed={isCollapsed}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                )
              }

              if (isSingleItem) {
                const item = group.items[0]
                return (
                  <div key={group.group} className="py-0.5">
                    <NavLinkItem
                      item={item}
                      isActive={isNavItemActive(pathname, item.href, allHrefs)}
                      isCollapsed={isCollapsed}
                      onNavigate={onNavigate}
                    />
                  </div>
                )
              }

              return (
                <Collapsible
                  key={group.group}
                  open={isOpen}
                  onOpenChange={(open) => toggleGroup(group.group, open)}
                  className="py-0.5"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                      groupActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="flex-1 truncate text-left">{group.group}</span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-0.5 pl-1">
                    {group.items.map((item) => (
                      <NavLinkItem
                        key={item.href}
                        item={item}
                        isActive={isNavItemActive(pathname, item.href, allHrefs)}
                        isCollapsed={isCollapsed}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        </nav>
      </ScrollArea>

      <div className="space-y-1 border-t border-border p-3">
        {isCollapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="w-full">
                  <Link href="/">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Back to site</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              asChild
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <Link href="/">
                <ExternalLink className="h-4 w-4" />
                <span className="ml-3">Back to site</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-3">Logout</span>
            </Button>
          </>
        )}
      </div>
    </aside>
  )
}
