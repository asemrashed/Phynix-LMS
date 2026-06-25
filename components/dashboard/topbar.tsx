"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavbarSearch } from "@/components/search/navbar-search"
import { useAuth } from "@/lib/auth-context"
import { getMediaUrl } from "@/lib/media-url"
import { cn } from "@/lib/utils"
import { BRAND_MONOGRAM, BRAND_NAME } from "@/lib/brand"

interface TopbarProps {
  homeHref?: string
  brandHref?: string
  onMenuClick?: () => void
  onNotificationsClick?: () => void
  unreadCount?: number
  plan?: string
  showSubscriptionBadge?: boolean
  className?: string
}

function planLabel(plan: string) {
  if (plan === "FREE") return "Free Plan"
  if (plan === "LIFETIME") return "Lifetime"
  return `${plan.charAt(0)}${plan.slice(1).toLowerCase()} Plan`
}

export function DashboardTopbar({
  homeHref = "/dashboard",
  brandHref = "/",
  onMenuClick,
  onNotificationsClick,
  unreadCount = 0,
  plan = "FREE",
  showSubscriptionBadge = false,
  className,
}: TopbarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const isStudent = user?.role === "STUDENT"

  const initials = user?.student
    ? `${user.student.firstName[0]}${user.student.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() ?? "U"
  const avatarSrc = getMediaUrl(user?.student?.avatarUrl)

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link href={brandHref} className="flex shrink-0 items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
          <span className="text-sm font-bold text-primary-foreground">{BRAND_MONOGRAM}</span>
        </div>
        <span className="text-base font-bold text-foreground">{BRAND_NAME}</span>
      </Link>

      <Link href={brandHref} className="hidden shrink-0 items-center gap-2 md:flex">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
          <span className="text-sm font-bold text-primary-foreground">{BRAND_MONOGRAM}</span>
        </div>
        <span className="text-base font-bold text-foreground">{BRAND_NAME}</span>
      </Link>

      <NavbarSearch className="mx-auto hidden max-w-md flex-1 md:block" />

      {showSubscriptionBadge && (
        <Badge variant="secondary" className="hidden rounded-lg sm:inline-flex">
          {planLabel(plan)}
        </Badge>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-xl xl:hidden"
        onClick={onNotificationsClick}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="rounded-xl px-2">
            <Avatar className="h-8 w-8">
              {avatarSrc && <AvatarImage src={avatarSrc} alt="Profile" />}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <div className="px-3 py-2">
            <p className="font-medium">
              {user?.student
                ? `${user.student.firstName} ${user.student.lastName}`
                : user?.email}
            </p>
            {user?.student?.uniqueStudentId && (
              <p className="text-xs text-muted-foreground">
                {user.student.uniqueStudentId}
              </p>
            )}
            {user?.role && !user.student && (
              <p className="text-xs capitalize text-muted-foreground">
                {user.role.replace("_", " ").toLowerCase()}
              </p>
            )}
          </div>
          <DropdownMenuSeparator />
          {isStudent && (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/portfolio">Portfolio</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href="/">Back to Site</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
