import type { Role } from "@fxprime/types"

export const ADMIN_ROLES: Role[] = ["ADMIN", "SUPER_ADMIN"]
export const INSTRUCTOR_ROLES: Role[] = ["INSTRUCTOR"]
export const STUDENT_PANEL_ROLES: Role[] = ["STUDENT"]

export function getDefaultPanelPath(role: Role | string | undefined | null): string {
  if (!role) return "/dashboard"
  if (ADMIN_ROLES.includes(role as Role)) return "/admin"
  if (role === "INSTRUCTOR") return "/instructor"
  return "/dashboard"
}

export function isStaffRole(role: Role | string | undefined | null): boolean {
  if (!role) return false
  return ADMIN_ROLES.includes(role as Role) || role === "INSTRUCTOR"
}

export function getSettingsPath(role: Role | string | undefined | null): string {
  if (STUDENT_PANEL_ROLES.includes(role as Role)) return "/dashboard/settings"
  return getDefaultPanelPath(role)
}

export function getOrdersPath(role: Role | string | undefined | null): string {
  if (STUDENT_PANEL_ROLES.includes(role as Role)) return "/dashboard/orders"
  return getDefaultPanelPath(role)
}

export function shouldRedirectFromDashboard(role: Role | string | undefined | null): boolean {
  return isStaffRole(role)
}
