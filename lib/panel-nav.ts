import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  UserCircle,
  Users,
  Bookmark,
  BarChart3,
  Settings,
  FileText,
  CreditCard,
  Quote,
  BadgeAlert,
} from "lucide-react"

export interface PanelNavItem {
  href: string
  label: string
  icon: LucideIcon
  comingSoon?: boolean
}

export interface PanelNavGroup {
  group: string
  items: PanelNavItem[]
}

export const STUDENT_NAV: PanelNavGroup[] = [
  {
    group: "Home",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "My Learning",
    items: [
      { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
      { href: "/dashboard/certificates", label: "Certificates", icon: GraduationCap },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/portfolio", label: "Portfolio", icon: UserCircle },
    ],
  },
  {
    group: "Connect",
    items: [
      { href: "/dashboard/community", label: "Community", icon: Users },
      { href: "/dashboard/bookmarks", label: "Bookmarks", icon: Bookmark },
    ],
  },
  {
    group: "Account",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
]

export const ADMIN_NAV: PanelNavGroup[] = [
  {
    group: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Content Studio",
    items: [
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
      { href: "/admin/blog", label: "Blog", icon: FileText },
      { href: "/admin/reviews", label: "Reviews", icon: Quote },
      { href: "/admin/certificates", label: "Certificates", icon: GraduationCap },
    ],
  },
  {
    group: "People",
    items: [{ href: "/admin/users", label: "Users", icon: Users }],
  },
  {
    group: "Finance",
    items: [
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/payments/pending", label: "Pending Verification", icon: BadgeAlert },
    ],
  },
]

export const INSTRUCTOR_NAV: PanelNavGroup[] = [
  {
    group: "Teaching",
    items: [
      { href: "/instructor", label: "Dashboard", icon: LayoutDashboard },
      { href: "/instructor/courses", label: "My Courses", icon: BookOpen },
      { href: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Account",
    items: [{ href: "/instructor/settings", label: "Settings", icon: Settings }],
  },
]
