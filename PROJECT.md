# Mavuno — Project Description

## Executive summary

**Mavuno** is a full-stack web application — a **climate-smart agricultural coordination platform** for Rwanda that connects farmers, cooperatives, buyers, transport providers, and storage facilities within a single digital ecosystem. It reduces post-harvest losses and improves market access by coordinating produce listings, orders, logistics, and storage across Rwanda's inter-district agricultural network.

The current implementation provides a **working prototype** of the operator/admin layer: fleet management, consignment dispatch, live tracking, financial ledger, and AI audit. The roadmap below defines what is built, what is in progress, and what remains to reach MVP scope per PRD v1.0.

---

## Product name & branding

- **Platform name:** Mavuno
- **Company:** SaibaX Hub Ltd
- **Browser title:** Mavuno — AgriTrans
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

### ✅ Operations dashboard (`/`) — built

Control-tower KPIs: users, open requests, commission rate, transaction pipeline, active dispatch.
Operational alerts: flagged pricing, pending verifications, successful dispatches.
**AI system audit**: aggregates live metrics → `POST /api/ai/audit` → DeepSeek narrative on verification backlog, open leads, commission impact, settlements, and dispatch health.
Navigation shortcuts to key screens.

---

### ✅ Operator registry / Admin users (`/users`) — built

Search and filter by role, district, status.
Add operator (in-memory), verify, flag, suspend, delete.
Sidebar badge for unverified (Pending) count.

> PRD alignment: covers Admin → Manage Users and Approve Accounts. Extend to support Cooperative and Storage Provider roles once those are added.

---

### ✅ Fleet registration (`/fleet`) — built

Vehicle types: motorcycle, pickup, truck, cold_storage.
Multi-step registration wizard (type, capacity, plate, insurance, districts, simulated uploads).
Status: Active, Pending, In Transit.

> PRD alignment: covers Transport Provider → Register Vehicle.

---

### ✅ Consignment leads / Transport requests (`/requests`) — built

Incoming transport solicitations: crop, weight (tons), origin/destination, distance, estimated price (RWF), urgency.
Counter-offer negotiation → accept → creates Processing transaction → navigates to tracking.
Decline removes request from queue.

> PRD alignment: covers Transport API → Request Transport / Accept Request / Update Status.

---

### ✅ Live dispatch tracking (`/tracking`) — built

Active dispatch: order ID, driver, vehicle, telemetry (speed, cargo temp, fuel efficiency, remaining km, ETA).
Lifecycle: Collected → In Transit → Near Hub → Delivered.
Delivered settles matching transaction and clears remaining distance.

> PRD alignment: covers Order status In Transit → Delivered. Extend to show buyer-facing status when buyer dashboard is built.

---

### ✅ Financial ledger (`/reports`) — built

Transactions: farmer/buyer, crop, weight, order value, commission, status (Settled, Processing, Failed).
Aggregates: total volume, commission earned, settled vs processing.
Commission recalculated when platform rate changes in settings.

> PRD alignment: covers Admin → Generate Reports and financial audit requirements.

---

### ✅ Platform parameters (`/settings`) — built

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

Routes will shift: landing page takes `/`, app moves behind auth to `/app/*`.

---

### 🔲 Authentication (`/sign-up`, `/sign-in`) — not built [PRD Phase 1]

Required flows per PRD:
- Sign Up with role selection (Farmer / Buyer / Cooperative / Transport / Storage)
- Sign In
- OTP verification (SMS to Rwanda phone number)
- Password reset

Implementation: Clerk for auth (JWT), Supabase for profile storage, NestJS for API layer.
All app routes gated behind `ClerkAuthGuard`.

---

### 🔲 Profile setup (post-registration onboarding) — not built [PRD Phase 1]

Fields per PRD: Full Name, Phone Number, Email, District, Sector, User Type, Profile Photo.
Role-specific fields: Farmer adds farm info; Buyer adds organisation type; Cooperative adds member capacity.

---

### 🔲 Farmer dashboard (`/app/farmer`) — not built [PRD Phase 1]

Cards: Active Listings, Orders, Revenue, Notifications.
Actions: Add Produce, View Orders, Request Transport.

---

### 🔲 Produce listing (`/app/farmer/listings`) — not built [PRD Phase 1]

Fields: Crop Name, Quantity, Unit, Harvest Date, Location, Quality Grade, Price, Images.
Actions: Add, Edit, Delete, Archive.
Implementation: multi-step form, client-side image compression, upload to Supabase Storage.

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
SMS fallback for critical events (Africa's Talking API, using templates already in /settings).
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

Order reference format: `MVN-{YEAR}-{5-digit-seq}` (e.g. `MVN-2026-00041`).

---

## Technical architecture

| Layer | Technology | Role |
|-------|------------|------|
| Client | React 19, TypeScript, Vite 6 | SPA with React Router 7 |
| Styling | Tailwind CSS 4 | Custom Mavuno theme |
| Icons / motion | Lucide React, Motion | UI polish |
| State (current) | `useReducer` + `AppContext` | Single source of truth; in-memory prototype |
| State (target) | React Query + Zustand | Server state + local UI state |
| Seed data | `src/lib/seed.ts` | Initial demo dataset |
| Auth | Clerk | JWT-based auth, OTP, role metadata |
| API | NestJS (port 3001) | Business logic, guards, services |
| Database | Supabase (PostgreSQL) | Persistent storage with RLS |
| File storage | Supabase Storage | Produce images, avatars |
| Real-time | Supabase Realtime | Order status, notification channels |
| AI audit | DeepSeek via Express proxy | `POST /api/ai/audit` |
| Dev proxy | Vite | `/api` → `localhost:3001` |
| Production | Vercel (frontend) + Railway/Render (API) | Hosted environment |

**Security:** `DEEPSEEK_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-side only. Never in client bundle. Clerk JWT verified on every NestJS request.

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
- **profiles** — clerk_user_id, full_name, phone, email, role, district, sector, avatar_url, is_verified, is_active
- **farms** — farmer_id, district, sector, cell, gps, size_hectares, primary_crops[]
- **produce_listings** — farmer_id, crop_name, quantity_kg, quality_grade, price_per_kg_rwf, harvest_date, images[], status, location
- **orders** — order_ref (MVN-*), buyer_id, listing_id, farmer_id, quantity_kg, total_rwf, status, delivery_type
- **order_status_history** — order_id, from_status, to_status, changed_by, created_at
- **cooperative_members** — cooperative_id, farmer_id, joined_at, status
- **storage_facilities** — provider_id, capacity_kg, available_kg, district, price_per_kg_per_day_rwf
- **storage_bookings** — facility_id, farmer_id, crop_name, quantity_kg, start_date, end_date, total_cost_rwf, status
- **notifications** — user_id, type, title, body, entity_type, entity_id, is_read

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
| Phase 5 | Climate intelligence alerts | Integrate weather API + alert farmers in affected districts |

All AI features call `POST /api/ai/*` from the NestJS layer. DeepSeek/Claude handles inference. Client uses a reusable `useAI(endpoint)` hook pattern (extend `useDeepSeekAudit`).

---

## Repository structure

```
Mavuno/
├── server/
│   └── index.ts                  # Express API — AI proxy + optional static dist
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx                 # React Router route definitions
│   ├── context/
│   │   └── AppContext.tsx         # useReducer global state (prototype)
│   ├── hooks/
│   │   ├── useDeepSeekAudit.ts    # AI audit hook
│   │   └── useAI.ts              # [to add] Generic AI hook for all phases
│   ├── lib/
│   │   ├── types.ts               # TypeScript data model
│   │   └── seed.ts                # Demo seed data
│   ├── layouts/
│   │   └── AppLayout.tsx          # Fixed sidebar + contextual header
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── ui/                    # [to add] Shared atoms (Button, Badge, Card, etc.)
│   └── pages/
│       ├── Dashboard.tsx          # /              — ✅ built
│       ├── Users.tsx              # /users         — ✅ built
│       ├── Fleet.tsx              # /fleet         — ✅ built
│       ├── Requests.tsx           # /requests      — ✅ built
│       ├── Tracking.tsx           # /tracking      — ✅ built
│       ├── Reports.tsx            # /reports       — ✅ built
│       ├── Settings.tsx           # /settings      — ✅ built
│       ├── Landing.tsx            # /              — 🔲 to build
│       ├── SignUp.tsx             # /sign-up       — 🔲 to build (Clerk)
│       ├── SignIn.tsx             # /sign-in       — 🔲 to build (Clerk)
│       ├── Onboarding.tsx         # /onboarding    — 🔲 to build
│       ├── FarmerDashboard.tsx    # /app/farmer    — 🔲 to build
│       ├── Marketplace.tsx        # /app/marketplace — 🔲 to build
│       ├── BuyerDashboard.tsx     # /app/buyer     — 🔲 to build
│       ├── Orders.tsx             # /app/orders    — 🔲 to build
│       ├── CoopDashboard.tsx      # /app/cooperative — 🔲 Phase 2
│       └── StorageDashboard.tsx   # /app/storage   — 🔲 Phase 3
├── index.html
├── vite.config.ts
├── package.json
├── .env.example
├── README.md
└── PROJECT.md
```

Path alias: `@/` → `src/`.

---

## Routes

### Public (no auth)
| Path | Screen | Status |
|------|--------|--------|
| `/` | Landing page | 🔲 to build |
| `/sign-up` | Registration + role selection | 🔲 to build |
| `/sign-in` | Sign in | 🔲 to build |

### Protected app routes (require auth)
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

---

## Development phases

### Phase 1 — Auth + Marketplace (next sprint)
Priority: highest. Unlocks real user testing.

1. Add Clerk — install `@clerk/clerk-react`, wrap app in `<ClerkProvider>`, gate `/app/*` routes with `<SignedIn>`.
2. Build Landing page at `/` (move current admin app to `/app/admin`).
3. Build Sign Up with role selector → redirect to Onboarding.
4. Build profile setup (Onboarding) with district/sector dropdowns (Rwanda admin data).
5. Build Farmer Dashboard + Produce Listing form.
6. Build Marketplace + Listing detail + Order creation.
7. Build Buyer Dashboard + Order tracking view.
8. Wire notifications: insert to `notifications` table on order events; use Supabase Realtime on client.

### Phase 2 — Orders + Logistics
1. Full order lifecycle with status machine (pending → accepted → in_transit → delivered → completed).
2. Integrate existing `/tracking` screen into buyer/farmer order flow.
3. Transport request auto-creation when order is accepted with `delivery_type=delivery`.
4. SMS notifications via Africa's Talking (extend existing `/settings` SMS templates).
5. Cooperative dashboard — member management + produce aggregation.

### Phase 3 — Storage integration
1. Storage Provider registration and facility management.
2. Storage browsing and booking from Farmer Dashboard.
3. Occupancy calendar and check-in/check-out flow.

### Phase 4 — Analytics dashboard
1. Migrate `/reports` into full analytics suite with charts (Recharts).
2. Geographic heatmap of orders by district.
3. Crop volume trends, buyer/farmer pairing success rate.
4. Admin report generation (PDF/CSV export).

### Phase 5 — AI features
1. Extend `useDeepSeekAudit` pattern into a generic `useAI(endpoint)` hook.
2. Market recommendations (Phase 1 AI).
3. Price forecasting, demand forecasting (Phase 2–3 AI).
4. Spoilage prediction, climate alerts (Phase 4–5 AI).

---

## Getting started

**Prerequisites:** Node.js 20+, DeepSeek API key (for audits), Clerk account, Supabase project.

```bash
npm install
cp .env.example .env.local
# Set: DEEPSEEK_API_KEY, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY,
#      SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
npm run dev        # UI :3000, API :3001
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Client + API (concurrently) |
| `npm run dev:client` | Vite only |
| `npm run dev:server` | Express with watch |
| `npm run build` | Production client bundle |
| `npm run start` | Serve `dist/` + API |
| `npm run lint` | TypeScript check |

---

## Environment variables

```bash
# AI
DEEPSEEK_API_KEY=...

# Clerk (auth)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server only

# App
PORT=3001
NODE_ENV=development
```

---

## Known limitations (current prototype)

| Limitation | Impact | Resolution in |
|------------|--------|---------------|
| No persistence — refresh resets to seed data | Cannot demo real data | Phase 1 (Supabase) |
| No authentication — open admin console | Not deployable to real users | Phase 1 (Clerk) |
| Single admin perspective — no role-based UIs | Farmers/buyers cannot self-serve | Phase 1 |
| No real GPS — simulated tracking telemetry | Tracking is demo only | Future (driver mobile app) |
| No payment processing — commission is calculated only | No real money movement | Future (MTN MoMo) |
| Single active dispatch object | Cannot manage concurrent deliveries | Phase 2 |
| AI audits optional — graceful failure without API key | Non-blocking | Already handled |

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
