import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { spawnSync } from "child_process"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, "..")
const backendRoot = process.env.FXPRIME_BACKEND_PATH
  ? path.resolve(process.env.FXPRIME_BACKEND_PATH)
  : path.resolve(frontendRoot, "../phy-server")
const typesRoot = path.join(backendRoot, "packages/types")
const dest = path.resolve(frontendRoot, "node_modules/@fxprime/types")

function copyTypesPackage() {
  if (!fs.existsSync(typesRoot)) {
    console.error(`Types package not found at ${typesRoot}`)
    process.exit(1)
  }

  fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(typesRoot, dest, {
    recursive: true,
    filter: (src) => !src.includes(`${path.sep}node_modules${path.sep}`),
  })
}

function ensureTypesDeps() {
  const install = spawnSync("bun", ["install"], {
    cwd: typesRoot,
    stdio: "inherit",
  })

  if (install.status !== 0) {
    process.exit(install.status ?? 1)
  }
}

ensureTypesDeps()

const build = spawnSync("bun", ["run", "build"], {
  cwd: typesRoot,
  stdio: "inherit",
})

if (build.status !== 0) {
  process.exit(build.status ?? 1)
}

copyTypesPackage()
console.log("Synced @fxprime/types into node_modules")
