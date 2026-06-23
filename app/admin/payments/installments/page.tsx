"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import type { AdminCourseItem, InstallmentPlanItem } from "@fxprime/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AdminInstallmentPlansPage() {
  const [plans, setPlans] = useState<InstallmentPlanItem[]>([])
  const [courses, setCourses] = useState<AdminCourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [courseId, setCourseId] = useState("")
  const [label, setLabel] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [installmentCount, setInstallmentCount] = useState("3")
  const [intervalDays, setIntervalDays] = useState("30")
  const [downPaymentPercent, setDownPaymentPercent] = useState("33")

  const load = () => {
    setLoading(true)
    Promise.all([
      api<InstallmentPlanItem[]>("/admin/installment-plans"),
      api<{ items: AdminCourseItem[] }>("/admin/courses?pageSize=100"),
    ])
      .then(([planData, courseData]) => {
        setPlans(planData)
        setCourses(courseData.items)
        if (courseData.items[0] && !courseId) {
          setCourseId(courseData.items[0].id)
        }
      })
      .catch(() => toast.error("Failed to load installment plans"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    if (!courseId || !label.trim() || !totalAmount) {
      toast.error("Fill in course, label, and total amount")
      return
    }

    setSaving(true)
    try {
      await api<InstallmentPlanItem>("/admin/installment-plans", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          label: label.trim(),
          totalAmount: Number(totalAmount),
          installmentCount: Number(installmentCount),
          intervalDays: Number(intervalDays),
          downPaymentPercent: Number(downPaymentPercent),
          isActive: true,
        }),
      })
      setLabel("")
      setTotalAmount("")
      toast.success("Installment plan created")
      load()
    } catch {
      toast.error("Failed to create plan")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (plan: InstallmentPlanItem) => {
    try {
      const updated = await api<InstallmentPlanItem>(`/admin/installment-plans/${plan.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !plan.isActive }),
      })
      setPlans((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch {
      toast.error("Failed to update plan")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Installment Plans</h1>
          <p className="text-sm text-muted-foreground">
            Create payment plans shown on course checkout.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin/payments/settings">Payment settings</Link>
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin/payments">Payments</Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-[20px]">
        <CardHeader>
          <CardTitle>Create plan</CardTitle>
          <CardDescription>
            Down payment unlocks course access after admin verifies the first installment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="plan-label">Plan label</Label>
              <Input
                id="plan-label"
                className="mt-1 rounded-xl"
                placeholder="3 Monthly Payments"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="total-amount">Total amount (BDT)</Label>
              <Input
                id="total-amount"
                type="number"
                min={1}
                className="mt-1 rounded-xl"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="installment-count">Number of installments</Label>
              <Input
                id="installment-count"
                type="number"
                min={2}
                max={12}
                className="mt-1 rounded-xl"
                value={installmentCount}
                onChange={(e) => setInstallmentCount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="interval-days">Days between installments</Label>
              <Input
                id="interval-days"
                type="number"
                min={7}
                max={90}
                className="mt-1 rounded-xl"
                value={intervalDays}
                onChange={(e) => setIntervalDays(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="down-percent">Down payment %</Label>
              <Input
                id="down-percent"
                type="number"
                min={10}
                max={90}
                className="mt-1 rounded-xl"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(e.target.value)}
              />
            </div>
          </div>
          <Button className="rounded-xl" onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create plan"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[20px]">
        <CardHeader>
          <CardTitle>Existing plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No installment plans yet.</p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{plan.label}</p>
                    <Badge variant={plan.isActive ? "secondary" : "outline"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    ৳{plan.totalAmount.toLocaleString()} · {plan.installmentCount} payments · every{" "}
                    {plan.intervalDays} days · down {plan.downPaymentPercent}%
                  </p>
                </div>
                <Switch checked={plan.isActive} onCheckedChange={() => toggleActive(plan)} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
