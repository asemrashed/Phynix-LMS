# FX Prime Academy — Frontend

Next.js 16 app for [FX Prime Academy](https://github.com/Adnan4141/fx-prime-frontend).

This repo is half of a **polyrepo**: the API lives in [fx-prime-backend](https://github.com/Adnan4141/fx-prime-backend).

## Local setup (polyrepo)

Clone both repos as **siblings** under one parent folder:

```bash
mkdir finance-academy && cd finance-academy

git clone git@github.com:Adnan4141/fx-prime-backend.git backend
git clone git@github.com:Adnan4141/fx-prime-frontend.git frontend
```

Expected layout:

```
finance-academy/
├── backend/     ← separate Git repo
└── frontend/    ← this repo
```

### Install & run

```bash
# Backend first (database + API)
cd ../backend
cp .env.example .env
bun install
bun run db:seed

# Frontend (syncs @fxprime/types from ../backend/packages/types)
cd ../frontend
cp .env.local.example .env.local
bun install
bun run dev          # http://localhost:3000
```

Run the API in another terminal: `cd backend && bun run dev` → http://localhost:4000

### Shared types

`@fxprime/types` is authored in the **backend** repo at `packages/types/`. On `bun install` / `bun run dev`, `scripts/sync-types.mjs` builds and copies them into `node_modules`.

If backend is not at `../backend`, set:

```bash
export FXPRIME_BACKEND_PATH=/path/to/backend
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base, default `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (production) |

See `.env.local.example`.

## Testing

```bash
bun run build
bun run lint

# E2E (needs seeded backend DB + Chromium)
bun run test:e2e:install   # once
export $(grep -v '^#' ../backend/.env | xargs)
bun run test:e2e
```

## Docs

- [Admin guide](./docs/ADMIN.md)
- Backend API: [backend/docs/API.md](https://github.com/Adnan4141/fx-prime-backend/blob/main/docs/API.md)
- Deploy: [backend/docs/DEPLOY.md](https://github.com/Adnan4141/fx-prime-backend/blob/main/docs/DEPLOY.md)

## GitHub

- **Repo:** [Adnan4141/fx-prime-frontend](https://github.com/Adnan4141/fx-prime-frontend)
- **CI:** `.github/workflows/ci.yml` — build + optional VPS deploy on `main`
