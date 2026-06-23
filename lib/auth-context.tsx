"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { AuthUser, RegisterRequest } from "@fxprime/types"
import {
  api,
  setAccessToken,
  refreshAccessToken,
  clearSessionCookies,
  ApiError,
} from "@/lib/api"
import { getDeviceFingerprint, getDeviceType } from "@/lib/device"
import { clearUserRoleCookie, setUserRoleCookie } from "@/lib/auth-cookie"

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string, options?: { forceLogout?: boolean }) => Promise<AuthUser>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  forceLogout: (deviceType: "PC" | "MOBILE") => Promise<void>
  refreshUser: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const me = await api<AuthUser>("/auth/me")
      setUser(me)
      setUserRoleCookie(me.role)
      return me
    } catch {
      setUser(null)
      setAccessToken(null)
      clearUserRoleCookie()
      await clearSessionCookies()
      return null
    }
  }, [])

  useEffect(() => {
    async function init() {
      const token = await refreshAccessToken()
      if (token) {
        await refreshUser()
      } else {
        clearUserRoleCookie()
      }
      setIsLoading(false)
    }
    init()
  }, [refreshUser])

  const login = async (
    email: string,
    password: string,
    options?: { forceLogout?: boolean }
  ) => {
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()

    const data = await api<{
      user: AuthUser
      accessToken: string
      expiresIn: number
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: normalizedEmail,
        password: normalizedPassword,
        deviceFingerprint: getDeviceFingerprint(),
        deviceType: getDeviceType(),
        forceLogout: options?.forceLogout,
      }),
    })
    setAccessToken(data.accessToken)
    setUser(data.user)
    setUserRoleCookie(data.user.role)
    return data.user
  }

  const register = async (registerData: RegisterRequest) => {
    await api<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(registerData),
    })
  }

  const logout = async () => {
    try {
      await api("/auth/logout", { method: "POST" })
    } catch {
      await clearSessionCookies()
    }
    setAccessToken(null)
    setUser(null)
    clearUserRoleCookie()
  }

  const forceLogout = async (deviceType: "PC" | "MOBILE") => {
    await api("/auth/force-logout", {
      method: "POST",
      body: JSON.stringify({ deviceType }),
    })
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, forceLogout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export { ApiError }
