"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { CartButton } from "@/components/cart/cart-button"
import { NavbarNotificationBell } from "@/components/navbar-notification-bell"
import { NavbarUserMenu } from "@/components/navbar-user-menu"
import { cn } from "@/lib/utils"

type NavLink = {
  href: string
  label: string
  description?: string
}

const learnLinks: NavLink[] = [
  {
    href: "/courses",
    label: "All Courses",
    description: "Browse our full catalog",
  },
  {
    href: "/courses?free=true",
    label: "Free Courses",
    description: "Start learning for free",
  },
]

const shopLinks: NavLink[] = [
  {
    href: "/marketplace",
    label: "Marketplace",
    description: "Physical & digital products",
  },
]

const resourceLinks: NavLink[] = [
  {
    href: "/blog",
    label: "Blog",
    description: "Articles & IELTS study tips",
  },
  {
    href: "/live",
    label: "Live Sessions",
    description: "Workshops & live classes",
  },
  {
    href: "/contact",
    label: "Contact",
    description: "Support & inquiries",
  },
]

const mobileSections = [
  { title: "Learn", links: learnLinks },
  { title: "Shop", links: shopLinks },
  { title: "Resources", links: resourceLinks },
]

function isPathActive(pathname: string, href: string) {
  const path = href.split("?")[0]
  if (path === "/") return pathname === "/"
  return pathname === path || pathname.startsWith(`${path}/`)
}

function isGroupActive(pathname: string, links: NavLink[]) {
  return links.some((link) => isPathActive(pathname, link.href))
}

function NavDropdownLink({ href, label, description }: NavLink) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className="flex flex-col gap-0.5 rounded-xl p-3 hover:bg-muted"
      >
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </Link>
    </NavigationMenuLink>
  )
}

function MobileNavLink({
  href,
  label,
  active,
  onNavigate,
}: NavLink & { active: boolean; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted",
        active && "bg-primary/10 text-primary"
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const closeMobile = () => setIsOpen(false)

  const pricingActive = isPathActive(pathname, "/pricing")
  const learnActive = isGroupActive(pathname, learnLinks)
  const shopActive = isGroupActive(pathname, shopLinks)
  const resourcesActive = isGroupActive(pathname, resourceLinks)

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
            <span className="text-sm font-bold text-primary-foreground sm:text-base">IL</span>
          </div>
          <span className="hidden text-lg font-bold text-foreground sm:inline">IELTS LMS</span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "rounded-xl bg-transparent text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary data-[state=open]:bg-muted",
                    learnActive && "text-primary"
                  )}
                >
                  Learn
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-56 gap-1 p-2">
                    {learnLinks.map((link) => (
                      <li key={link.href}>
                        <NavDropdownLink {...link} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "rounded-xl bg-transparent text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary data-[state=open]:bg-muted",
                    shopActive && "text-primary"
                  )}
                >
                  Shop
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-56 gap-1 p-2">
                    {shopLinks.map((link) => (
                      <li key={link.href}>
                        <NavDropdownLink {...link} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "rounded-xl bg-transparent text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary data-[state=open]:bg-muted",
                    resourcesActive && "text-primary"
                  )}
                >
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-56 gap-1 p-2">
                    {resourceLinks.map((link) => (
                      <li key={link.href}>
                        <NavDropdownLink {...link} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/pricing"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "rounded-xl bg-transparent text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary",
                      pricingActive && "text-primary"
                    )}
                  >
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 sm:flex md:gap-2">
            <NavbarNotificationBell />
            <CartButton />
          </div>

          <div className="hidden md:flex">
            <NavbarUserMenu />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <CartButton />
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closeMobile}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                    {mobileSections.map((section) => (
                      <div key={section.title} className="mb-4">
                        <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.title}
                        </p>
                        <div className="flex flex-col gap-1">
                          {section.links.map((link) => (
                            <MobileNavLink
                              key={link.href}
                              {...link}
                              active={isPathActive(pathname, link.href)}
                              onNavigate={closeMobile}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="mb-6">
                      <MobileNavLink
                        href="/pricing"
                        label="Pricing"
                        active={pricingActive}
                        onNavigate={closeMobile}
                      />
                    </div>

                    <div className="space-y-3 border-t pt-6">
                      <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Account
                      </p>
                      <div className="flex items-center gap-2 px-4">
                        <NavbarNotificationBell />
                        <span className="text-sm text-muted-foreground">
                          Notifications
                        </span>
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
