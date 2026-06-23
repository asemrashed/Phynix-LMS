import { test, expect } from "@playwright/test"
import { prisma } from "../../phy-server/src/lib/prisma"

const hasDatabase = !!process.env.DATABASE_URL
const PAID_COURSE_SLUG = "forex-trading-masterclass"

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login")
  await page.getByLabel("Email").fill(email)
  await page.getByLabel("Password").fill(password)
  await page.getByRole("button", { name: "Sign In" }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe("Student purchase flow", () => {
  test.skip(!hasDatabase, "Set DATABASE_URL (seeded DB required)")

  test("register → buy course → dev payment → enrolled", async ({ page }) => {
    const email = `e2e-${Date.now()}@fxprime.test`
    const password = "password12345"

    try {
    await page.goto("/register")
    await page.getByLabel("First Name").fill("E2E")
    await page.getByLabel("Last Name").fill("Student")
    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password").fill(password)
    await page.getByRole("button", { name: "Register" }).click()

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 })

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    })
    await page.context().clearCookies()
    await login(page, email, password)

    await page.goto(`/courses/${PAID_COURSE_SLUG}`)
    await expect(page.getByRole("button", { name: "Buy Now" })).toBeVisible()
    await page.getByRole("button", { name: "Buy Now" }).click()

    await expect(page).toHaveURL(new RegExp(`/checkout\\?courseId=`))
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible()
    await page.getByRole("button", { name: /Pay |Continue to/ }).click()

    await expect(page).toHaveURL(new RegExp(`/courses/${PAID_COURSE_SLUG}`), { timeout: 30_000 })
    await expect(
      page.getByRole("link", { name: /Continue Learning|Start Learning/ })
    ).toBeVisible()

    await page.goto("/dashboard/courses")
    await expect(page.getByText(/Forex Trading Masterclass|Masterclass/i).first()).toBeVisible()
    } finally {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { student: true },
      })
      if (user?.student) {
        const studentId = user.student.id
        await prisma.enrollment.deleteMany({ where: { studentId } })
        await prisma.paymentRecord.deleteMany({ where: { studentId } })
        await prisma.subscription.deleteMany({ where: { studentId } })
        await prisma.student.delete({ where: { id: studentId } }).catch(() => {})
      }
      await prisma.user.delete({ where: { email } }).catch(() => {})
    }
  })
})
