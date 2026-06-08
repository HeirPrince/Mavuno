---
name: user-role-management
description: >
  Implements and debugs role-based access control in the Mavuno stack (Clerk + Supabase + Express +
  React Router). Use when adding or changing roles, building RequireRole guards, wiring Clerk
  publicMetadata, syncing roles to Supabase profiles, protecting routes or API endpoints, writing
  RLS policies that depend on role, building onboarding role selection, redirecting users to role
  dashboards, or fixing "unauthorized" / "wrong dashboard" issues. Triggers include questions like
  "restrict this page to admins", "store the user's role after sign-up", or "check role server-side".
---

# User Role Management (Mavuno)

Full vertical slice of RBAC for Clerk + Supabase + Express: store role at sign-up, enforce on every route and API endpoint.

**Reference files** (read when implementing):
- [references/patterns.md](references/patterns.md) — copy-paste React/Express patterns
- [references/rls.md](references/rls.md) — Supabase RLS policy templates

---

## Role model

Six roles, **PascalCase** — single source of truth in `src/lib/roles.ts`:

```typescript
export const USER_ROLES = [
  'Farmer', 'Buyer', 'Cooperative', 'Transport', 'Storage', 'Admin',
] as const;
export type UserRole = (typeof USER_ROLES)[number];
```

| Role | Dashboard |
|------|-----------|
| Farmer | `/app/farmer` |
| Buyer | `/app/buyer` |
| Cooperative | `/app/cooperative` |
| Transport | `/app/admin/fleet` |
| Storage | `/app/storage` |
| Admin | `/app/admin` |

`Admin` is never user-selectable at sign-up. Keep client (`src/lib/schemas/role.ts`) and server (`server/schemas/auth.ts`) selectable-role lists in sync.

---

## Where the role lives

Two stores that must stay in sync:

1. **Clerk `publicMetadata.role`** — authoritative for JWT/client. Read via `useRole()`. Written **server-side only** via Clerk Backend SDK (`server/routes/auth.ts`).

2. **Supabase `profiles.role`** — synced on `POST /api/auth/set-role` and `POST /api/auth/complete-profile` via `upsertProfile()`.

Never let the React client call `updateUserMetadata` directly — that enables privilege escalation.

---

## Onboarding flow

```
/sign-up → Clerk UI → /onboarding?step=role → POST /api/auth/set-role → /onboarding?step=profile → POST /api/auth/complete-profile → role dashboard
```

Key files: `src/pages/Onboarding.tsx`, `src/components/RoleSelector.tsx`, `server/routes/auth.ts`.

---

## Client-side enforcement

| File | Purpose |
|------|---------|
| `src/hooks/useRole.ts` | Read role from Clerk `publicMetadata` |
| `src/lib/roleRedirect.ts` | `ROLE_HOME` map + `getRoleHome()` |
| `src/components/RequireRole.tsx` | Layout route guard (uses `<Outlet />`) |
| `src/components/RoleRedirect.tsx` | `/app` index → role dashboard |
| `src/routes.tsx` | Route tree with `<RequireRole allowed="...">` |

**RequireRole contract:**
- Loading → spinner (wait for Clerk + profile)
- No role → `/onboarding?step=role`
- Role but incomplete profile → `/onboarding?step=profile`
- Wrong role → `getRoleHome(role)` (not a generic 403 page)
- Correct role → render `<Outlet />`

Use `allowed` prop (single role or array). Example:

```tsx
<Route element={<RequireRole allowed={['Farmer', 'Buyer']} />}>
  <Route path="app/orders" element={<Orders />} />
</Route>
```

---

## Server-side enforcement

Express middleware in `server/middleware/clerkAuth.ts`:

```typescript
// JWT verification
router.post('/set-role', requireClerkAuth, handler);

// Role check — chain after requireClerkAuth
router.get('/admin/users', requireClerkAuth, requireRole('Admin'), handler);
```

`getUserRole(req)` reads `sessionClaims.publicMetadata.role`.

---

## Supabase RLS

Migration: `supabase/migrations/001_role_rls.sql`. Policies use **PascalCase** role strings (`'Farmer'`, `'Admin'`) via `current_user_role()` helper.

See [references/rls.md](references/rls.md) for per-table templates and JWT impersonation tests.

---

## Decision checklist

When adding or changing role logic, verify all layers:

- [ ] `USER_ROLES` in `src/lib/roles.ts` includes the role
- [ ] `ROLE_HOME` in `src/lib/roleRedirect.ts` has an entry
- [ ] `ROUTES` in `src/lib/routes.ts` updated if paths change
- [ ] Route wrapped with `<RequireRole allowed="...">` in `src/routes.tsx`
- [ ] Express route uses `requireRole(...)` after `requireClerkAuth`
- [ ] Supabase RLS policy covers the new access pattern (PascalCase)
- [ ] Role selector includes the option (if user-selectable)
- [ ] Client + server Zod schemas stay in sync
