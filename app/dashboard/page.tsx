"use client"

import { useEffect, useState } from "react"
import { PortfolioCard } from "@/components/dashboard/portfolio-card"
import { ContinueLearning } from "@/components/dashboard/continue-learning"
import { LearningStreakWidget } from "@/components/dashboard/learning-streak-widget"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Package, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import type {
  ProductPurchaseItem,
  OrderItem,
  StudentEnrollmentItem,
  StudentPortfolio,
  SubscriptionInfo,
  LearningGoals,
} from "@fxprime/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<StudentEnrollmentItem[]>([])
  const [portfolioStats, setPortfolioStats] = useState<StudentPortfolio["stats"] | null>(null)
  const [purchases, setPurchases] = useState<ProductPurchaseItem[]>([])
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [learningGoals, setLearningGoals] = useState<LearningGoals | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [enrollmentData, portfolioData, purchaseData, orderData, subData, goalsData] =
          await Promise.all([
            api<StudentEnrollmentItem[]>("/courses/enrollments/me").catch(() => []),
            api<StudentPortfolio>("/students/me/portfolio").catch(() => null),
            api<ProductPurchaseItem[]>("/products/digital/purchases/me").catch(() => []),
            api<OrderItem[]>("/products/orders/me").catch(() => []),
            api<SubscriptionInfo>("/subscription/me").catch(() => null),
            api<LearningGoals>("/students/me/learning-goals").catch(() => null),
          ])
        setEnrollments(enrollmentData)
        setPortfolioStats(portfolioData?.stats ?? null)
        setPurchases(purchaseData)
        setOrders(orderData)
        setSubscription(subData)
        setLearningGoals(goalsData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (!user) return null

  const continueCourses = enrollments
    .filter((e) => e.progress < 100)
    .map((e) => ({
      id: e.course.id,
      slug: e.course.slug,
      title: e.course.title,
      progress: e.progress,
      lastLessonId: e.lastLessonId,
      lastLessonTitle: e.lastLessonTitle,
      watchPosition: e.watchPosition,
      thumbnailUrl: e.course.thumbnailUrl,
    }))

  return (
    <div className="space-y-8">
      <PortfolioCard
        user={user}
        plan={subscription?.plan || "FREE"}
        stats={{
          coursesEnrolled: portfolioStats?.coursesEnrolled ?? enrollments.length,
          certificates: portfolioStats?.certificates ?? 0,
          products: purchases.length,
          learningHours: portfolioStats?.learningHours ?? 0,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {!loading && <ContinueLearning courses={continueCourses} />}
        <LearningStreakWidget goals={learningGoals} loading={loading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">My Products</h2>
          {purchases.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Package />
                </EmptyMedia>
                <EmptyTitle>No products yet</EmptyTitle>
                <EmptyDescription>
                  Digital products you purchase will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="space-y-2">
              {purchases.slice(0, 3).map((p) => (
                <li key={p.id} className="text-sm text-muted-foreground">
                  {p.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-[20px] bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">Recent Orders</h2>
          {orders.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>No orders yet</EmptyTitle>
                <EmptyDescription>
                  Physical product orders will appear here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="space-y-2">
              {orders.slice(0, 3).map((o) => (
                <li key={o.id} className="text-sm text-muted-foreground">
                  {o.orderCode} — ৳{o.total}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
