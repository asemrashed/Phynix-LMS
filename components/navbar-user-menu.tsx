"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { getDefaultPanelPath } from "@/lib/get-default-panel"
import { getMediaUrl } from "@/lib/media-url"
import { cn } from "@/lib/utils"

interface NavbarUserMenuProps {
  className?: string
  onNavigate?: () => void
}

export function NavbarUserMenu({ className, onNavigate }: NavbarUserMenuProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    onNavigate?.()
    await logout()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href="/login" onClick={onNavigate}>
            Login
          </Link>
        </Button>
        <Button className="rounded-xl bg-primary hover:bg-primary/90" asChild>
          <Link href="/register" onClick={onNavigate}>
            Sign Up
          </Link>
        </Button>
      </div>
    )
  }

  const panelHref = getDefaultPanelPath(user.role)
  const isStudent = user.role === "STUDENT"
  const initials = user.student
    ? `${user.student.firstName[0]}${user.student.lastName[0]}`
    : user.email?.[0]?.toUpperCase() ?? "U"
  const avatarSrc = getMediaUrl(user.student?.avatarUrl)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn("rounded-xl px-2", className)}>
          <Avatar className="h-8 w-8">
            {avatarSrc && <AvatarImage src={avatarSrc} alt="Profile" />}
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl">
        <div className="px-3 py-2">
          <p className="font-medium">
            {user.student
              ? `${user.student.firstName} ${user.student.lastName}`
              : user.email}
          </p>
          {user.student?.uniqueStudentId && (
            <p className="text-xs text-muted-foreground">
              {user.student.uniqueStudentId}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={panelHref} onClick={onNavigate}>
            My Dashboard
          </Link>
        </DropdownMenuItem>
        {isStudent && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/portfolio" onClick={onNavigate}>
                Portfolio
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" onClick={onNavigate}>
                Settings
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
