import { defineConfig, devices } from "@playwright/test"
import path from "path"

const frontendDir = path.join(__dirname, "..")
const backendDir = process.env.FXPRIME_BACKEND_PATH
  ? path.resolve(process.env.FXPRIME_BACKEND_PATH)
  : path.join(__dirname, "../../phy-server")

export default defineConfig({
  testDir: __dirname,
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_SKIP_SERVERS
    ? undefined
    : [
        {
          command: "bun run dev",
          cwd: backendDir,
          url: "http://127.0.0.1:4000/api/v1/health",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            NODE_ENV: "development",
            REQUIRE_EMAIL_VERIFICATION: "false",
            SKIP_DEVICE_LIMIT: "true",
            FRONTEND_URL: "http://localhost:3000",
            SSLCOMMERZ_STORE_ID: "",
            SSLCOMMERZ_STORE_PASSWD: "",
            STRIPE_SECRET_KEY: "",
          },
        },
        {
          command: "bun run dev",
          cwd: frontendDir,
          url: "http://127.0.0.1:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            NEXT_PUBLIC_API_URL: "/api/v1",
            NEXT_PUBLIC_WS_URL: "http://127.0.0.1:4000",
            API_INTERNAL_URL: "http://127.0.0.1:4000",
            NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
          },
        },
      ],
})
