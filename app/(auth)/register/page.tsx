"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, ApiError } from "@/lib/auth-context"
import { getSettingsPath } from "@/lib/get-default-panel"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { BRAND_MONOGRAM, BRAND_NAME } from "@/lib/brand"

const schema = z.object({
  firstName: z.string().trim().min(1, "First name required"),
  lastName: z.string().trim().min(1, "Last name required"),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().optional(),
  password: z.string().trim().min(8, "Password must be at least 8 characters"),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser, login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      await registerUser(data)
      const loggedInUser = await login(data.email, data.password)
      toast.success("Account created! Check your email to verify before enrolling or paying.")
      router.push(getSettingsPath(loggedInUser.role))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className={cn("w-full max-w-md rounded-[20px] bg-card p-8 shadow-sm")}>
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-lg font-bold text-primary-foreground">{BRAND_MONOGRAM}</span>
            </div>
            <span className="text-xl font-bold text-foreground">{BRAND_NAME}</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Start your English learning journey
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                autoComplete="given-name"
                className="mt-1 rounded-xl"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                autoComplete="family-name"
                className="mt-1 rounded-xl"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="mt-1 rounded-xl"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="mt-1 rounded-xl"
              placeholder="+880..."
              {...register("phone")}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              className="mt-1 rounded-xl"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
