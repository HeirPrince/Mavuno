# Mavuno — Project Description

## Executive summary

**Mavuno** is a full-stack web application — a **climate-smart agricultural coordination platform** for Rwanda that connects farmers, cooperatives, buyers, transport providers, and storage facilities within a single digital ecosystem. It reduces post-harvest losses and improves market access by coordinating produce listings, orders, logistics, and storage across Rwanda's inter-district agricultural network.

The current implementation provides a **working prototype** of the operator/admin layer: fleet management, consignment dispatch, live tracking, financial ledger, and AI audit. **Clerk authentication** is partially integrated — sign-in, sign-up, and route protection are live; role selection, profile sync, and role-based dashboards are not yet built. The roadmap below defines what is built, what is in progress, and what remains to reach MVP scope per PRD v1.0.

---

## Product name & branding

- **Platform name:** Mavuno
- **Company:** SaibaX Hub Ltd
- **Browser title:** Mavuno — AgriTrans *(fix: `index.html` still reads "AgriTrans Logistics" — update immediately)*
- **Tagline:** Connect. Harvest. Thrive.
- **Fonts:** Playfair Display (headings), Plus Jakarta Sans (UI)
- **Palette:** primary `#154212`, secondary `#9c4416`, background `#fdf8f5`
- **Visual accent:** Imigongo-inspired borders and patterns

> Note: The prototype previously used "AgriTrans Logistics" as its sole browser title. The canonical product name is **Mavuno**; AgriTrans may be used as a sub-brand for the logistics/fleet layer only.

---

## Problem and purpose

Smallholder agriculture in Rwanda depends on reliable movement of bulk crops between farms, washing stations, cooperatives, and hubs across the country. Coordinating who can ship, which vehicle is licensed for which districts, which consignments are urgent, and how commission and settlement flow through the platform is fragmented across spreadsheets, phone calls, and informal networks.

Mavuno models a **central coordination platform** for the full agricultural value chain: farmers list produce, buyers discover and order it, cooperatives aggregate supply, transport providers move goods, storage providers hold surplus, and admins verify, audit, and report on everything.

---

## Target users and roles

| Role | Primary responsibilities | Dashboard |
|------|--------------------------|-----------|
| **Farmer** | Create farm profile, list produce, request transport/storage, track orders | Farmer Dashboard |
| **Cooperative** | Register members, aggregate produce, manage bulk orders | Cooperative Dashboard |
| **Buyer** | Browse marketplace, place orders, track deliveries, rate suppliers | Buyer Dashboard |
| **Transport Provider** | Register vehicles, accept dispatch requests, update delivery status | Transport Queue |
| **Storage Provider** | Register facilities, manage capacity, accept bookings | Storage Dashboard |
| **Admin** | Verify accounts, manage users, view analytics, generate reports, configure platform | Admin Dashboard |

User records carry: `id`, `name`, `email`, `role`, `district`, `status` (Verified / Pending / Flagged / Suspended), `joinDate`, `initials`.

---

## Functional modules

### ✅ Operations dashboard (`/app/admin`) — built (Clerk-protected)

Control-tower KPIs: users, open requests, commission rate, transaction pipeline, active dispatch.
Operational alerts: flagged pricing, pending verifications, successful dispatches.
**AI system audit**: aggregates live metrics → `POST /api/ai/audit` → DeepSeek narrative on verification backlog, open leads, commission impact, settlements, and dispatch health.
Navigation shortcuts to key screens.

> **Note:** This currently lives at `/` but must migrate to `/app/admin` when the public landing page is built in Phase 1. All internal links must be updated in the same PR.

---

### ✅ Operator registry / Admin users (`/app/admin/users`) — built

Search and filter by role, district, status.
Add operator (in-memory), verify, flag, suspend, delete.
Sidebar badge for unverified (Pending) count.

> PRD alignment: covers Admin → Manage Users and Approve Accounts. Extend to support Cooperative and Storage Provider roles once those are added.

---

### ✅ Fleet registration (`/app/admin/fleet`) — built

Vehicle types: motorcycle, pickup, truck, cold_storage.
Multi-step registration wizard (type, capacity, plate, insurance, districts, simulated uploads).
Status: Active, Pending, In Transit.

> PRD alignment: covers Transport Provider → Register Vehicle.

---

### ✅ Consignment leads / Transport requests (`/app/admin/requests`) — built

Incoming transport solicitations: crop, weight (tons), origin/destination, distance, estimated price (RWF), urgency.
Counter-offer negotiation → accept → creates Processing transaction → navigates to tracking.
Decline removes request from queue.

> PRD alignment: covers Transport API → Request Transport / Accept Request / Update Status.

---

### ✅ Live dispatch tracking (`/app/admin/tracking`) — built

Active dispatch: order ID, driver, vehicle, telemetry (speed, cargo temp, fuel efficiency, remaining km, ETA).
Lifecycle: Collected → In Transit → Near Hub → Delivered.
Delivered settles matching transaction and clears remaining distance.

> **Known limitation:** only one dispatch object is tracked at a time. Multi-dispatch support is a Phase 2 task (see roadmap).

> PRD alignment: covers Order status In Transit → Delivered. Extend to show buyer-facing status when buyer dashboard is built.

---

### ✅ Financial ledger (`/app/admin/reports`) — built

Transactions: farmer/buyer, crop, weight, order value, commission, status (Settled, Processing, Failed).
Aggregates: total volume, commission earned, settled vs processing.
Commission recalculated when platform rate changes in settings.

> PRD alignment: covers Admin → Generate Reports and financial audit requirements.

---

### ✅ Platform parameters (`/app/admin/settings`) — built

Commission % and logistics surcharge (RWF).
Quality grades and crop catalog with share percentages.
SMS/Email templates with placeholders (`{{farmer_name}}`, `{{crop_type}}`, etc.).

> PRD alignment: covers Admin → Manage Platform Settings.

---

### 🔲 Public landing page (`/`) — not built [PRD Phase 1]

Required sections per PRD:
- Hero section (headline, sub-headline, CTA buttons: Register / Login)
- About Mavuno
- Features (6-card grid)
- How It Works (4-step flow)
- Testimonials carousel
- Contact form

**Route migration required:** once this page is built, the admin app moves from `/` to `/app/admin/*`. All existing internal links must be updated in the same PR.

> **Current behaviour:** `/` is the protected operations dashboard (not a public landing page). Unauthenticated visitors are redirected to `/sign-in`.

---

### 🟡 Authentication (`/sign-in`, `/sign-up`) — partially built [PRD Phase 1]

**Built:**
- Clerk integration via `@clerk/react` (`ClerkProvider` in `ClerkRoot`, React Router navigation)
- Sign-in page at `/sign-in/*` and sign-up page at `/sign-up/*` (Clerk hosted UI, Mavuno-branded shell)
- All operator routes gated behind `RequireAuth` — unauthenticated users redirect to `/sign-in`
- Sidebar `UserMenu`: Clerk avatar/name, sign-out
- Production runtime config: Express injects `VITE_CLERK_PUBLISHABLE_KEY` into `index.html` via `window.__MAVUNO_RUNTIME_CONFIG__` when env vars are not baked into the Vite build

**Not yet built:**
- Sign-up role selection (Farmer / Buyer / Cooperative / Transport / Storage)
- OTP verification (SMS to Rwanda phone number) — Clerk defaults only
- Password reset flows customised for Mavuno
- Supabase profile storage and Clerk webhook sync
- `RequireRole` component — wraps routes that require a specific role; redirects unauthorised users to their own role dashboard
- Role-based routing to `/app/*` dashboards
- Server-side JWT verification on API routes (target: NestJS `ClerkAuthGuard`)

Implementation target: Clerk for auth (JWT), Supabase for profile storage, NestJS for API layer.

---

### 🔲 Profile setup (post-registration onboarding) — not built [PRD Phase 1]

Fields per PRD: Full Name, Phone Number, Email, District, Sector, User Type, Profile Photo.
Role-specific fields: Farmer adds farm info; Buyer adds organisation type; Cooperative adds member capacity.

All form inputs must be validated with **Zod** before submission (see Validation section).

---

### 🔲 Farmer dashboard (`/app/farmer`) — not built [PRD Phase 1]

Cards: Active Listings, Orders, Revenue, Notifications.
Actions: Add Produce, View Orders, Request Transport.

---

### 🔲 Produce listing (`/app/farmer/listings`) — not built [PRD Phase 1]

Fields: Crop Name, Quantity, Unit, Harvest Date, Location, Quality Grade, Price, Images.
Actions: Add, Edit, Delete, Archive.
Implementation: multi-step form with Zod validation, client-side image compression, upload to Supabase Storage bucket `produce-images/{listing_id}/{filename}`. Store public URLs in `produce_listings.images[]`.

---

### 🔲 Marketplace (`/app/marketplace`) — not built [PRD Phase 1]

Browse all active produce listings.
Search by keyword.
Filter by crop, district, quality grade, price range, availability date.
Contact seller (in-app message).
Create order from listing detail page.

---

### 🔲 Buyer dashboard (`/app/buyer`) — not built [PRD Phase 1]

Cards: Available Produce, Active Orders, Delivery Status.
Actions: Search Produce, Place Order.

---

### 🔲 Order lifecycle (`/app/orders`) — not built [PRD Phase 1]

Statuses: Pending → Accepted → In Transit → Delivered → Completed.
Buyer: place order, track status, mark completed, rate supplier.
Farmer: accept/reject incoming orders.
Notifications triggered on each status transition.

**Order reference format:** `MVN-{YEAR}-{5-digit-seq}` (e.g. `MVN-2026-00041`).
Sequence uniqueness is enforced via a PostgreSQL `SEQUENCE` (`order_seq`) incremented atomically on each `INSERT`; the reference is never generated client-side.

---

### 🔲 Cooperative dashboard (`/app/cooperative`) — not built [PRD Phase 2]

Cards: Total Farmers, Total Produce, Active Orders.
Actions: Manage Members, Aggregate Produce.
Member table with invite, bulk message, export.
Produce aggregation: combine farmer listings into a single bulk offer.

---

### 🔲 Storage Provider module (`/app/storage`) — not built [PRD Phase 3]

Storage Provider: register facility (type, capacity, district, pricing), manage availability, accept bookings.
Farmer: browse available storage, book capacity, manage check-in/check-out.
Data: `storage_facilities` and `storage_bookings` tables.

---

### 🔲 Notification system — not built [PRD Phase 1]

In-app notification feed per user.
Types: New Order, Order Accepted, Delivery Update, Market Alert, Weather Alert.
SMS fallback for critical events (Africa's Talking API, using templates already in `/settings`).
Supabase Realtime channel: `notifications:{user_id}`.

---

## End-to-end business flow

```
Farmer lists produce
  → Buyer browses marketplace → places order
  → Farmer accepts order
  → Transport provider accepts dispatch request
  → Tracking: Collected → In Transit → Near Hub → Delivered
  → Buyer marks completed → rates farmer
  → Transaction settled → commission recorded in ledger
  → Admin reviews analytics → AI audit summarises performance
```

---

## Technical architecture

### Current stack

| Layer | Technology | Role |
|-------|------------|------|
| Client | React 19, TypeScript, Vite 6 | SPA with React Router 7 |
| Styling | Tailwind CSS 4 | Custom Mavuno theme |
| Icons / motion | Lucide React, Motion | UI polish |
| State | `useReducer` + `AppContext` | Single source of truth; in-memory prototype |
| Seed data | `src/lib/seed.ts` | Initial demo dataset |
| Auth | `@clerk/react` | Sign-in/up, session, route guards (`RequireAuth`) |
| API | Express (port 3001) | AI audit proxy + production static SPA |
| AI audit | DeepSeek via Express | `POST /api/ai/audit` |
| Dev proxy | Vite | `/api` → `localhost:3001` |
| Production | Express single process | Serves `dist/` + API; injects Clerk key at runtime |

### Target stack (PRD / Phase 1+)

| Layer | Technology | Role |
|-------|------------|------|
| State | React Query + Zustand | Server state + local UI state |
| Validation | Zod | Schema validation for all forms and API payloads |
| Auth | Clerk + Supabase profiles | JWT, OTP, role metadata, webhooks |
| API | NestJS (port 3001) | Business logic, guards, services |
| Database | Supabase (PostgreSQL) | Persistent storage with RLS |
| File storage | Supabase Storage | Produce images (`produce-images/` bucket), avatars (`avatars/` bucket) |
| Real-time | Supabase Realtime | Order status, notification channels |
| SMS | Africa's Talking | OTP delivery and order event notifications |
| Weather | Open-Meteo API | Climate intelligence alerts (Phase 5 AI) |
| Hosting | Vercel (frontend) + Railway/Render (API) | Hosted environment |
| Testing | Vitest (unit/component), Playwright (E2E) | Regression coverage |

**Security:**
- `DEEPSEEK_API_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `AFRICASTALKING_API_KEY` are **server-side only** — never in the client bundle.
- `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_SUPABASE_ANON_KEY` are safe for the client, **but Supabase Row Level Security (RLS) must be enabled on every table before the anon key is used in production**. Without RLS, any authenticated user can read all rows across the entire database.
- Target: verify Clerk JWT on every NestJS request via `ClerkAuthGuard`; no unauthenticated access to `/api/*`.

---

## Data model

Defined in `src/lib/types.ts` (current prototype types — extend for full PRD):

### Current
- **User** — id, name, email, role, district, status, joinDate, initials
- **Vehicle** — type, plate, capacity (kg), insurance, districts[], status
- **TransportRequest** — crop, weight, route, pricing, urgency, status
- **DispatchTracking** — order, driver, vehicle, telemetry, ETA, status history
- **Transaction** — parties, crop, RWF amounts, commission, settlement status
- **PlatformConfig** — commission, surcharge, grades[], crops[], templates[]
- **AuditMetrics** — snapshot sent to AI audit endpoint

### To add (PRD-required, target Supabase schema)
- **profiles** — `clerk_user_id` (unique, indexed), full_name, phone, email, role, district, sector, avatar_url (Supabase Storage URL under `avatars/`), is_verified, is_active
- **farms** — farmer_id (FK → profiles), district, sector, cell, gps, size_hectares, primary_crops[]
- **produce_listings** — farmer_id, crop_name, quantity_kg, quality_grade, price_per_kg_rwf, harvest_date, `images text[]` (public URLs from Supabase Storage bucket `produce-images/{listing_id}/`), status, location
- **orders** — `order_ref` generated via DB sequence as `MVN-{YEAR}-{5-digit-seq}`, buyer_id, listing_id, farmer_id, quantity_kg, total_rwf, status, delivery_type
- **order_status_history** — order_id, from_status, to_status, changed_by, created_at
- **cooperative_members** — cooperative_id, farmer_id, joined_at, status
- **storage_facilities** — provider_id, capacity_kg, available_kg, district, price_per_kg_per_day_rwf
- **storage_bookings** — facility_id, farmer_id, crop_name, quantity_kg, start_date, end_date, total_cost_rwf, status
- **notifications** — user_id, type, title, body, entity_type, entity_id, is_read

**RLS requirement:** every table above must have Row Level Security policies defined before the Supabase anon key is used in the client. Minimum policy: "users can only read/write rows they own or are party to."

---

## AI integration

### Current (built)
- **Endpoint:** `POST /api/ai/audit`
- **Model:** `deepseek-chat` (temperature 0.4, max 800 tokens)
- **Context:** Rwandan AgriTrans operations analyst; metrics JSON in request body
- **Client:** `useDeepSeekAudit` hook — loading, summary, errors; modal on success, toast on failure

### Roadmap (per PRD AI phases)

| Phase | Feature | Notes |
|-------|---------|-------|
| Phase 1 | Market recommendations | Suggest best buyer matches for a listing |
| Phase 2 | Price forecasting | Predict fair price per crop/district/season |
| Phase 3 | Demand forecasting | Project buyer demand over next 30 days |
| Phase 4 | Spoilage prediction | Estimate loss risk based on crop + storage days |
| Phase 5 | Climate intelligence alerts | Integrate Open-Meteo API + alert farmers in affected districts |

All AI features call `POST /api/ai/*` from the API layer (Express today; NestJS target). DeepSeek handles inference. Client uses the `useAI(endpoint)` hook (`src/hooks/useAI.ts`) — a generalisation of `useDeepSeekAudit`. All Phase 1+ AI features should use `useAI` rather than a new hook per feature.

---

## Validation strategy

All user-facing forms and NestJS API request bodies must be validated with **Zod**:

- Define schemas in `src/lib/schemas/` (client) and `src/api/schemas/` (server).
- Share schema definitions across client and server where the payload is identical.
- Use `schema.parse()` at API boundary entry points (NestJS validation pipes) and `schema.safeParse()` in React forms to surface field-level errors without throwing.
- Validate at minimum: produce listing fields, profile setup fields, order creation, storage booking, and all auth-adjacent payloads.

---

## Testing strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Utility functions, reducers, Zod schemas, hooks |
| Component | Vitest + React Testing Library | UI behaviour, form validation feedback |
| E2E | Playwright | Critical paths: sign-up → onboarding → list produce → place order → track delivery |
| API | Vitest (NestJS testing module) | Guard logic, service methods, DB interactions (mocked) |

Tests live in `src/__tests__/` (client) and `src/api/__tests__/` (server). CI runs `npm run typecheck && npm run lint && npm run test` on every pull request.

---

## Repository structure

```
Mavuno/
├── server/
│   └── index.ts                  # Express — AI proxy, static dist, runtime Clerk config
├── src/
│   ├── main.tsx                  # BrowserRouter + ClerkRoot + App
│   ├── App.tsx
│   ├── routes.tsx                # React Router route definitions
│   ├── providers/
│   │   └── ClerkRoot.tsx         # ClerkProvider + React Router integration
│   ├── context/
│   │   └── AppContext.tsx        # useReducer global state (prototype)
│   ├── hooks/
│   │   ├── useDeepSeekAudit.ts   # AI audit hook (legacy — superseded by useAI)
│   │   └── useAI.ts              # Generic AI hook; use for all Phase 1+ AI features
│   ├── lib/
│   │   ├── types.ts              # TypeScript data model
│   │   ├── seed.ts               # Demo seed data
│   │   ├── runtimeConfig.ts      # Clerk key from Vite env or runtime injection
│   │   └── schemas/              # [to add] Zod schemas for client-side validation
│   ├── layouts/
│   │   └── AppLayout.tsx         # Fixed sidebar + contextual header
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── UserMenu.tsx          # Clerk session display + sign-out
│   │   ├── RequireAuth.tsx       # Auth gate — redirects to /sign-in if no session
│   │   ├── RequireRole.tsx       # [to add] Role gate — redirects to own dashboard if role does not match
│   │   ├── feedback/
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   └── ui/                   # [to add] Shared atoms (Button, Badge, Card, etc.)
│   ├── __tests__/                # [to add] Vitest unit + component tests
│   └── pages/
│       ├── AuthPage.tsx          # /sign-in, /sign-up      — 🟡 Clerk UI
│       ├── DashboardPage.tsx     # /app/admin              — ✅ built (migrate from /)
│       ├── UsersPage.tsx         # /app/admin/users        — ✅ built (migrate from /users)
│       ├── FleetPage.tsx         # /app/admin/fleet        — ✅ built (migrate from /fleet)
│       ├── RequestsPage.tsx      # /app/admin/requests     — ✅ built (migrate from /requests)
│       ├── TrackingPage.tsx      # /app/admin/tracking     — ✅ built (migrate from /tracking)
│       ├── ReportsPage.tsx       # /app/admin/reports      — ✅ built (migrate from /reports)
│       ├── SettingsPage.tsx      # /app/admin/settings     — ✅ built (migrate from /settings)
│       ├── Landing.tsx           # /                       — 🔲 to build
│       ├── Onboarding.tsx        # /onboarding             — 🔲 to build
│       ├── NotFound.tsx          # 404 fallback            — 🔲 to build
│       ├── FarmerDashboard.tsx   # /app/farmer             — 🔲 to build
│       ├── Marketplace.tsx       # /app/marketplace        — 🔲 to build
│       ├── BuyerDashboard.tsx    # /app/buyer              — 🔲 to build
│       ├── Orders.tsx            # /app/orders             — 🔲 to build
│       ├── CoopDashboard.tsx     # /app/cooperative        — 🔲 Phase 2
│       └── StorageDashboard.tsx  # /app/storage            — 🔲 Phase 3
├── index.html                    # ⚠ Title still "AgriTrans Logistics" — update to "Mavuno — AgriTrans"
├── vite.config.ts
├── package.json
├── .env.example
├── README.md
└── PROJECT.md
```

Path alias: `@/` → `src/`.

---

## Routes

### Public (no auth required)
| Path | Screen | Status |
|------|--------|--------|
| `/` | Public landing page | 🔲 to build |
| `/sign-in/*` | Sign in (Clerk) | 🟡 built |
| `/sign-up/*` | Sign up (Clerk) | 🟡 built (no role selector yet) |

### Protected app routes (Clerk session + role required)
| Path | Screen | Role | Status |
|------|--------|------|--------|
| `/app` | Redirect to role dashboard | All | 🔲 |
| `/app/farmer` | Farmer dashboard | Farmer | 🔲 |
| `/app/farmer/listings` | Produce listings | Farmer | 🔲 |
| `/app/marketplace` | Browse produce | Buyer | 🔲 |
| `/app/buyer` | Buyer dashboard | Buyer | 🔲 |
| `/app/orders` | Order management | Farmer / Buyer | 🔲 |
| `/app/cooperative` | Cooperative dashboard | Cooperative | 🔲 Phase 2 |
| `/app/storage` | Storage management | Storage Provider | 🔲 Phase 3 |
| `/app/admin` | Admin dashboard | Admin | 🔲 (migrate from `/`) |
| `/app/admin/users` | User management | Admin | 🔲 (migrate from `/users`) |
| `/app/admin/fleet` | Fleet registration | Admin / Transport | 🔲 (migrate from `/fleet`) |
| `/app/admin/requests` | Consignment leads | Admin | 🔲 (migrate from `/requests`) |
| `/app/admin/tracking` | Live dispatch | Admin / Transport | 🔲 (migrate from `/tracking`) |
| `/app/admin/reports` | Financial ledger | Admin | 🔲 (migrate from `/reports`) |
| `/app/admin/settings` | Platform settings | Admin | 🔲 (migrate from `/settings`) |

**Fallback behaviour:**
- Unauthenticated users hitting any `/app/*` route → redirect to `/sign-in`.
- Authenticated users with the wrong role hitting a route → redirect to their own role dashboard (e.g. a Farmer hitting `/app/admin` → `/app/farmer`). Handled by `RequireRole`.
- Unmatched paths → dedicated `NotFound` (404) page. Do **not** silently redirect to the admin dashboard; this will break once `/` becomes the public landing page.

> **Current state (prototype):** all protected routes still live at `/`, `/users`, `/fleet`, etc. Route migration to `/app/admin/*` happens as part of Phase 1 when the landing page is built.

---

## Development phases

### Phase 1 — Auth + Marketplace (in progress)
Priority: highest. Unlocks real user testing.

1. ~~Add Clerk~~ — **done (partial):** `@clerk/react`, `ClerkProvider`, `/sign-in` + `/sign-up`, `RequireAuth` on operator routes, `UserMenu`, production runtime key injection.
2. Add Zod (validation) and Vitest + Playwright (testing) to the project. Create `RequireRole` component.
3. Build `NotFound` (404) page and fix the unmatched-route fallback in `routes.tsx`.
4. Build Landing page at `/`; migrate admin app from `/` → `/app/admin/*` (update all internal links in the same PR).
5. Extend Sign Up with role selector → redirect to `/onboarding`.
6. Build profile setup (Onboarding) with district/sector dropdowns (Rwanda admin data); wire Supabase `profiles` + Clerk webhooks. Enable RLS on all tables before connecting the anon key in the client.
7. Add role-based routing — restrict `/app/admin/*` to Admin role; gate all `/app/*` routes by role via `RequireRole`.
8. Build Farmer Dashboard + Produce Listing form (Zod validation + Supabase Storage upload to `produce-images/`).
9. Build Marketplace + Listing detail + Order creation (order_ref generated from PostgreSQL sequence).
10. Build Buyer Dashboard + Order tracking view.
11. Wire notifications: insert to `notifications` table on order events; subscribe via Supabase Realtime.

### Phase 2 — Orders + Logistics
1. Full order lifecycle with status machine (Pending → Accepted → In Transit → Delivered → Completed).
2. Integrate existing `/app/admin/tracking` screen into buyer/farmer order flow; extend to support **multiple concurrent dispatch objects** (removes single-dispatch limitation).
3. Transport request auto-creation when order is accepted with `delivery_type=delivery`.
4. SMS notifications via Africa's Talking (extend existing SMS templates from `/settings`).
5. Cooperative dashboard — member management + produce aggregation.

### Phase 3 — Storage integration
1. Storage Provider registration and facility management.
2. Storage browsing and booking from Farmer Dashboard.
3. Occupancy calendar and check-in/check-out flow.

### Phase 4 — Analytics dashboard
1. Migrate `/app/admin/reports` into full analytics suite with charts (Recharts).
2. Geographic heatmap of orders by district.
3. Crop volume trends, buyer/farmer pairing success rate.
4. Admin report generation (PDF/CSV export).

### Phase 5 — AI features
1. Confirm `useAI(endpoint)` hook is complete and replace `useDeepSeekAudit` usages.
2. Market recommendations (Phase 1 AI).
3. Price forecasting, demand forecasting (Phase 2–3 AI).
4. Spoilage prediction (Phase 4 AI).
5. Climate intelligence alerts using Open-Meteo API (Phase 5 AI).

---

## Getting started

**Prerequisites:** Node.js 20+, [Clerk](https://dashboard.clerk.com) account (auth), DeepSeek API key (optional — for audits). Supabase project required for Phase 1 persistence (not wired yet).

```bash
npm install
cp .env.example .env.local
# Required for auth: VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
# Optional for audits: DEEPSEEK_API_KEY
npm run dev        # UI :3000, API :3001
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Client + API (concurrently) |
| `npm run dev:client` | Vite only (port 3000) |
| `npm run dev:server` | Express with watch (port 3001) |
| `npm run build` | Production client bundle → `dist/` |
| `npm run start` | Serve `dist/` + API; injects Clerk key at runtime |
| `npm run preview` | Vite preview of production build |
| `npm run typecheck` | TypeScript type-check only (`tsc --noEmit`) |
| `npm run lint` | ESLint across `src/` |
| `npm run test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright end-to-end tests |

---

## Environment variables

Defined in `.env.example` (copy to `.env.local` for local dev; Express also reads `.env`):

```bash
# Clerk (auth) — required for sign-in/up
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # client (VITE_ prefix for Vite dev/build)
CLERK_SECRET_KEY=sk_test_...             # server only — needed for webhooks/API guards

# Optional alias for production when VITE_ vars are not baked into the build:
# CLERK_PUBLISHABLE_KEY=pk_test_...

# AI audit — optional; dashboard audit button returns 503 without it
DEEPSEEK_API_KEY=...

# Express API port (Vite proxies /api here in development)
PORT=3001
```

**Planned (Phase 1 — add to `.env.example`):**

```bash
# Clerk webhook signature verification
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase — VITE_ keys are safe for the client ONLY when RLS is enabled on all tables
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # server only — never expose to client

# Africa's Talking (SMS) — required for Phase 2 notifications
AFRICASTALKING_API_KEY=...
AFRICASTALKING_USERNAME=...
```

---

## Known limitations (current prototype)

| Limitation | Impact | Resolution in |
|------------|--------|---------------|
| No persistence — refresh resets to seed data | Cannot demo real data | Phase 1 (Supabase) |
| Auth without roles — any Clerk user sees full admin console | No farmer/buyer self-serve; weak access control | Phase 1 (role metadata + `RequireRole`) |
| No public landing page — `/` is the protected dashboard | Cannot market or onboard via homepage | Phase 1 |
| Clerk profiles not synced to Supabase | No platform user records beyond Clerk | Phase 1 (webhooks) |
| Express API has no auth guards | `/api/ai/audit` is open on the server | Phase 1 (NestJS + JWT) |
| Single admin perspective — no role-based UIs | Farmers/buyers cannot self-serve | Phase 1 |
| Single active dispatch object | Cannot manage concurrent deliveries | Phase 2 |
| No form or API payload validation | Bad data can enter the system unchecked | Phase 1 (Zod) |
| No automated tests | Regressions are invisible until manual QA | Phase 1 (Vitest + Playwright) |
| Unmatched routes silently redirect to `/` | Will break when `/` becomes the landing page | Phase 1 (add `NotFound` page) |
| `npm run lint` runs `tsc --noEmit` (type-check only, not ESLint) | Real lint errors go undetected; script name is misleading | Phase 1 (add ESLint; rename tsc script to `typecheck`) |
| No real GPS — simulated tracking telemetry | Tracking is demo only | Future (driver mobile app) |
| No payment processing — commission is calculated only | No real money movement | Future (MTN MoMo) |
| AI audits optional — graceful failure without API key | Non-blocking | Already handled |
| Browser title still "AgriTrans Logistics" | Branding inconsistency vs Mavuno | Quick fix in `index.html` |

---

## Success metrics (PRD Year 1 targets)

| Metric | Target |
|--------|--------|
| Farmers onboarded | 500 |
| Buyers onboarded | 50 |
| Cooperatives onboarded | 20 |
| Successful transactions | 1,000 |
| Post-harvest loss reduction | Measurable among pilot users |

---

## Future extensions

- Mobile app (React Native or PWA)
- MTN MoMo / Airtel Money settlement
- Real-time GPS via driver mobile app
- Multi-dispatch map view and route optimisation
- Cold chain monitoring with IoT sensor integration
- Export marketplace (connect to international buyers)
- Government analytics dashboard
- Offline-first PWA for low-connectivity rural areas
