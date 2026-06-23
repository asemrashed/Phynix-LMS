import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {
  ADMIN_ROLES,
  INSTRUCTOR_ROLES,
  getDefaultPanelPath,
  shouldRedirectFromDashboard,
} from "@/lib/get-default-panel"
import { resolvePostAuthRedirect } from "@/lib/safe-redirect"

const protectedPaths = ["/dashboard", "/admin", "/instructor", "/checkout"]
const authPaths = ["/login", "/register"]

const ADMIN_ROLE_SET = new Set(ADMIN_ROLES)
const INSTRUCTOR_ROLE_SET = new Set(INSTRUCTOR_ROLES)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const refreshToken = request.cookies.get("refreshToken")
  const userRole = request.cookies.get("userRole")?.value

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p))

  if (isProtected && !refreshToken) {
    const loginUrl = new URL("/login", request.url)
    const redirectTarget = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set("redirect", redirectTarget)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname.startsWith("/admin") && refreshToken && userRole && !ADMIN_ROLE_SET.has(userRole)) {
    return NextResponse.redirect(new URL(getDefaultPanelPath(userRole), request.url))
  }

  if (
    pathname.startsWith("/instructor") &&
    refreshToken &&
    userRole &&
    !INSTRUCTOR_ROLE_SET.has(userRole)
  ) {
    return NextResponse.redirect(new URL(getDefaultPanelPath(userRole), request.url))
  }

  if (pathname.startsWith("/dashboard") && refreshToken && userRole) {
    if (shouldRedirectFromDashboard(userRole)) {
      return NextResponse.redirect(new URL(getDefaultPanelPath(userRole), request.url))
    }
  }

  if (isAuthPage && refreshToken) {
    const redirect = request.nextUrl.searchParams.get("redirect")
    return NextResponse.redirect(
      new URL(resolvePostAuthRedirect(redirect, userRole ?? undefined), request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/instructor",
    "/instructor/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
}
