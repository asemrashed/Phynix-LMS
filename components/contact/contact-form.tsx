"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { CONTACT_SUBJECTS } from "@/lib/contact-info"
import type { ContactInquiryResponse, InquirySubject } from "@fxprime/types"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional(),
  subject: z.enum([
    "GENERAL",
    "COURSE",
    "PAYMENT",
    "CONSULTATION",
    "TECHNICAL",
    "PARTNERSHIP",
  ]),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(2000, "Message is too long"),
  website: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const SUBJECT_HINTS: Partial<Record<InquirySubject, string>> = {
  PAYMENT: "Include your order ID or payment reference if available.",
  TECHNICAL: "Describe what you were doing when the issue occurred.",
  CONSULTATION: "Tell us what kind of support you need and we'll follow up by email.",
}

export function ContactForm({ className }: { className?: string }) {
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "GENERAL",
      website: "",
    },
  })

  const subject = watch("subject")

  useEffect(() => {
    if (!user) return
    const student = user.student
    if (student) {
      setValue("name", `${student.firstName} ${student.lastName}`.trim())
      setValue("phone", student.phone || "")
    }
    setValue("email", user.email)
  }, [user, setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const result = await api<ContactInquiryResponse>("/contact", {
        method: "POST",
        body: JSON.stringify(data),
      })
      setSubmitted(true)
      reset({ subject: "GENERAL", website: "" })
      toast.success(result.message)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Alert className={cn("rounded-[20px]", className)}>
        <AlertDescription>
          Thank you! Your message has been received. We typically reply within 24–48 hours.
          {" "}
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={() => setSubmitted(false)}
          >
            Send another message
          </button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-name">Full name</Label>
          <Input
            id="contact-name"
            className="mt-1 rounded-xl"
            placeholder="Your name"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            className="mt-1 rounded-xl"
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-phone">Phone (optional)</Label>
          <Input
            id="contact-phone"
            className="mt-1 rounded-xl"
            placeholder="+880..."
            {...register("phone")}
          />
        </div>
        <div>
          <Label>Subject</Label>
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {CONTACT_SUBJECTS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {SUBJECT_HINTS[subject] && (
        <p className="text-sm text-muted-foreground">
          {SUBJECT_HINTS[subject]}{" "}
          {subject === "PAYMENT" && (
            <Link href="/refund-policy" className="text-primary hover:underline">
              Refund policy
            </Link>
          )}
        </p>
      )}

      <div>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          className="mt-1 min-h-32 rounded-xl"
          placeholder="How can we help you?"
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
        )}
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        {...register("website")}
      />

      {user && (
        <p className="text-xs text-muted-foreground">
          Signed in as {user.email} — your inquiry will be linked to your account.
        </p>
      )}

      <Button type="submit" className="w-full rounded-xl sm:w-auto" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send message"
        )}
      </Button>
    </form>
  )
}
