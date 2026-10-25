# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Flazly — a multi-tenant SaaS that turns a business's Instagram DMs, comments and story replies into an AI-driven sales agent and CRM. Two independent apps in one repo, no root `package.json`: run everything from `backend/` or `frontend/`.

- `backend/` — NestJS 10 + TypeORM + PostgreSQL + Redis + socket.io
- `frontend/` — React 19 + Vite + Tailwind 4 + react-router

The backend was scaffolded from an unrelated "jewelstock" NestJS template, so `package.json` name, `backend/README.md` and the Swagger title still say Jewel Stock. Ignore those; they describe nothing in this product.

## Commands

Backend (`cd backend`):

```bash
npm run start:dev      # watch mode, listens on PORT (8001 locally per .env)
npm run build          # nest build -> dist/
npm run start:prod     # node dist/main
npm test               # jest; testRegex is src/**/*.spec.ts
npx jest src/Service/Instagram.handoff.spec.ts        # one file
npx jest -t "suppresses the AI reply"                 # one test by name
npm run test:e2e       # test/jest-e2e.json
```

Frontend (`cd frontend`):

```bash
npm run dev            # Vite on https://localhost:5173
npm run build          # tsc -b && vite build
npm run lint           # eslint (backend has no lint script)
```

The dev server runs over **HTTPS with a self-signed cert** (`@vitejs/plugin-basic-ssl`) because Facebook Login refuses to open its OAuth dialog from a non-secure page — accept the browser warning once. For the same reason `/api` and `/socket.io` are *proxied* through Vite to `DEV_BACKEND_URL` (default `http://localhost:8001`) instead of being called directly; keep `VITE_API_BASE_URL` relative or the browser blocks it as mixed content.

API surface: global prefix `api` + URI versioning, so routes are `/api/v1/<Controller>/<Route>`. Swagger UI at `/swagger`.

## Backend architecture

**One monolithic module.** `src/app.module.ts` registers every controller and provider — there are no feature modules. A new service or controller must be added to its `providers`/`controllers` array or Nest will not resolve it.

**Path aliases** (`@Service/*`, `@Controller/*`, `@Database/*`, `@Helper/*`, `@Model/*`, `@Config/*`) are declared in **two** places that must stay in sync: `tsconfig.json` `paths` and the `jest.moduleNameMapper` block inside `package.json`.

**TypeORM Active Record, not repositories.** Entities extend `BaseTable` (`src/Database/Table/BaseTable.ts`) which extends `BaseEntity`, and code calls `company.findOne(...)` / `instagram_lead.save()` directly. Nothing injects `@InjectRepository`. Entities are auto-discovered from `src/Database/**`. `BaseTable`'s audit columns (`created_by_id`, `created_on`, `updated_by_id`, `updated_on`) are `select: false`, so they must be requested explicitly.

**Schema changes are manual SQL.** `DB_SYNC` is false in production; migrations live in `backend/deployment/migrations/*.sql` as idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, applied with `psql "$DATABASE_URL" -f ...`. This matters more than usual: TypeORM enumerates every declared column in its SELECTs, so adding a column to an entity without shipping the migration breaks ordinary *reads* on that table, not just writes.

**Tenancy.** `company` is the tenant. The JWT payload carries `company_id` and `user_id`; controllers read `req.user?.company_id` (or the `@CurrentUser()` decorator from `@Helper/Common.helper` for the user id) and pass it as the first argument to every service method. Plan gating comes from `@Config/PlanLimits` (`PLAN_LIMITS[company.plan]`) — contact/account/team/automation caps and AI message quota.

**Secrets at rest.** `instagram_access_token` uses `SecretColumnTransformer` (`@Helper/SecretColumn.transformer`), AES via `SECERT_KEY` (misspelling is load-bearing — it is the real env var name), with an `enc:v1:` envelope prefix and plaintext passthrough for legacy rows. Rotating `SECERT_KEY` makes every stored Meta token undecryptable and forces every workspace to reconnect.

### The Instagram webhook path

`POST /api/v1/Instagram/Webhook` (`src/Controller/Instagram.controller.ts`) is the product's hot path and has several constraints encoded in it:

- Signature is an HMAC-SHA256 over `req.rawBody` (hence `rawBody: true` in `main.ts`) compared with `crypto.timingSafeEqual`. `BYPASS_SIGNATURE` only works when `NODE_ENV !== 'production'`.
- Handlers are deliberately **not awaited** so Meta gets its 200 immediately — and each promise therefore *must* carry its own `.catch()`, since an unhandled rejection takes the whole Node process down mid-conversation.
- Webhook payloads contain customer message text and Instagram user ids; logging is restricted to event shape on purpose. Don't add payload logging.
- De-duplication of Meta retries goes through Redis (`claimMessageId`, `ig_mid_seen:<mid>`, `SET NX`), falling back to a bounded in-memory `Set` when Redis is down. Redis is required, not optional.

`InstagramService.processIncomingMessage` (`src/Service/Instagram.service.ts`, ~1.7k lines) is the automation engine, and the order of its stages is the business logic: dedupe → echo detection → plan expiry / AI quota / active-contact limits → welcome message → story-reply OCR (`OCRService` + tesseract, `eng.traineddata` is in `backend/`) → story-mention auto-reply → **automation suppression** → FAQ fuzzy match → playbook triggers → rule-based scoring → AI classification and reply → usage increment and 80%/100% alerts.

The suppression step is the human-agent handoff: inbound messages are always persisted and pushed to the inbox, but nothing below that line may auto-reply while `lead.human_agent_active` is set or `company.auto_reply_enabled` is off.

All Meta calls go through `graph.facebook.com/${GRAPH_VERSION}` where `GRAPH_VERSION` is exported from `Instagram.service.ts` (`META_GRAPH_VERSION`, default `v21.0`). Comment and media mutations first call `assertOwnsMedia` / `assertOwnsComment` so one tenant cannot act on another's content.

### Other backend pieces

- **AI** — `AI.service.ts` talks to Groq, OpenAI and Gemini through one OpenAI-compatible `chat/completions` shape. Provider comes from a DB setting, else `ACTIVE_LLM_PROVIDER`, else Groq; a failed primary falls back to Groq `llama-3.3-70b-versatile`. Keys may be stored encrypted in system settings rather than env.
- **Background work** — `TokenMonitorService` uses `setInterval` from `onModuleInit` (token health 6h, monthly usage reset 1h, cold-lead follow-ups 30m); `SubscriptionCronService` uses `@Cron` daily at midnight. Both run in-process, so they fire once per instance — scaling the backend horizontally would double them.
- **Realtime** — `InstagramGateway` emits with `server.emit`, i.e. globally, not per-company rooms.
- **Meta compliance** — `DataDeletion` and `Deauthorize` verify Meta's `signed_request` and resolve the workspace by `company.meta_user_id`; they actually purge data rather than just returning a confirmation code. `Legal.controller.ts` serves the privacy/terms/deletion-instructions pages Meta review requires.
- **Auth** — email/password, Google and Facebook login, email verification, TOTP 2FA with recovery codes, admin lockout, and a `SUPER_ADMIN` role with `Owner`/`Support`/`Security` sub-roles enforced by `AdminSubRoleGuard` + `@SuperAdminRoles(...)`.

## Frontend architecture

`src/App.tsx` holds the entire route table plus the app chrome, and branches on `window.location.hostname`: `flazly.com`/`www.flazly.com`/`landing.*` render the marketing site (`src/pages/landing/*`), `app.flazly.com` renders the product. Super-admin impersonation stashes the real admin session in `localStorage.admin_token`/`admin_user` and restores it on exit.

`src/lib/axios.ts` is the single API client: it attaches `localStorage.token` as a bearer header and, on any 401, clears auth storage and hard-redirects to `/login`. Per-area wrappers live in `src/api/*.api.ts`.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which SSHes into the VPS, resets `/var/www/Thalapathi/Flazly` to `origin/main`, builds frontend then backend, and `pm2 restart flazly-backend`. `nginx.conf` serves `frontend/dist` and proxies `/api/` to `localhost:8001`. Migrations are **not** part of that pipeline — apply them yourself.

CORS origins are a hardcoded allowlist in `backend/src/main.ts` (plus any `*.vercel.app`); a new domain has to be added there. `main.ts` also starts the bare Express server *before* Nest finishes booting to survive a 6-second platform health check.

## Reference material in the repo

- `backend/.env.example` — every env var with notes on what breaks if it's wrong
- `backend/deployment/deployment_guide.md` — Meta permissions, App Review and live-mode steps
- `artifacts/*.md` — product breakdown and Meta App Review audit reports
- `backend/scratch/`, `scratch_docx/`, `extracted_plan.txt` — one-off operator scripts and scratch notes, not part of the build
