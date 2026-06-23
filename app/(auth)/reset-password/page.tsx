"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  })

type FormData = z.infer<typeof schema>

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) return
    setLoading(true)
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: data.password }),
      })
      toast.success("Password reset! Please sign in.")
      router.push("/login")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reset failed")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Invalid reset link.</p>
        <Link href="/forgot-password">
          <Button className="mt-4 rounded-xl">Request New Link</Button>
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          className="mt-1 rounded-xl"
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input
          id="confirm"
          type="password"
          className="mt-1 rounded-xl"
          {...register("confirm")}
        />
        {errors.confirm && (
          <p className="mt-1 text-sm text-destructive">{errors.confirm.message}</p>
        )}
      </div>
      <Button type="submit" className="w-full rounded-xl" disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className={cn("w-full max-w-md rounded-[20px] bg-card p-8 shadow-sm")}>
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        </div>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  )
}
