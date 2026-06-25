"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { NavbarNotificationBell } from "@/components/navbar-notification-bell"
import { NavbarUserMenu } from "@/components/navbar-user-menu"
import { cn } from "@/lib/utils"
import { BRAND_MONOGRAM, BRAND_NAME } from "@/lib/brand"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "All Courses" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
]

function isPathActive(pathname: string, href: string) {
  const path = href.split("?")[0]
  if (path === "/") return pathname === "/"
  return pathname === path || pathname.startsWith(`${path}/`)
}

const navLinkClass = (active: boolean) =>
  cn(
    navigationMenuTriggerStyle(),
    "rounded-xl bg-transparent text-sm font-medium text-foreground/80 transition-colors",
    "hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary",
    "data-[state=open]:bg-primary/10 data-[state=open]:text-primary",
    active && "bg-primary/10 font-semibold text-primary"
  )

function MobileNavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string
  label: string
  active: boolean
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary",
        active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80"
      )}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname.startsWith("/courses") && window.location.search.includes("free=true")) {
      router.replace("/courses")
    }
  }, [pathname, router])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const closeMobile = () => setIsOpen(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary sm:h-10 sm:w-10">
            <span className="text-sm font-bold text-primary-foreground sm:text-base">{BRAND_MONOGRAM}</span>
          </div>
          <span className="hidden text-lg font-bold text-foreground sm:inline">{BRAND_NAME}</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild>
                    <Link href={link.href} className={navLinkClass(isPathActive(pathname, link.href))}>
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex md:gap-2">
            <NavbarNotificationBell />
          </div>

          <div className="hidden md:flex">
            <NavbarUserMenu />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b p-4">
                    <span className="text-lg font-bold">Menu</span>
                    <Button variant="ghost" size="icon" onClick={closeMobile}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col gap-1">
                      {navLinks.map((link) => (
                        <MobileNavLink
                          key={link.href}
                          href={link.href}
                          label={link.label}
                          active={isPathActive(pathname, link.href)}
                          onNavigate={closeMobile}
                        />
                      ))}
                    </div>

                    <div className="mt-6 space-y-3 border-t pt-6">
                      <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Account
                      </p>
                      <div className="flex items-center gap-2 px-4">
                        <NavbarNotificationBell />
                        <span className="text-sm text-muted-foreground">Notifications</span>
                      </div>
                      <div className="px-4">
                        <NavbarUserMenu
                          className="w-full flex-col gap-2 [&>*]:w-full"
                          onNavigate={closeMobile}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
