# RLS — Mavuno Supabase Context

**Canonical migration:** `supabase/migrations/001_role_rls.sql`

**Full policy templates and RBAC context:** [user-role-management skill](../../user-role-management/SKILL.md) → [references/rls.md](../../user-role-management/references/rls.md)

---

## Prerequisites

Enable RLS on every table **before** connecting `VITE_SUPABASE_ANON_KEY` in the React client:

```sql
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE produce_listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms              ENABLE ROW LEVEL SECURITY;
```

---

## JWT helpers

Mavuno uses Clerk JWTs (not Supabase Auth). Policies read Clerk claims:

```sql
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'role',
    auth.jwt() -> 'publicMetadata' ->> 'role'
  );
$$;

CREATE OR REPLACE FUNCTION current_clerk_id()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT auth.jwt() ->> 'sub';
$$;
```

Role strings are **PascalCase** (`'Farmer'`, `'Admin'`) — must match Clerk `publicMetadata.role`.

---

## Clerk JWT template

Clerk Dashboard → JWT Templates → create **supabase** template:
- Algorithm: HS256
- Claims: `{ "role": "authenticated" }` (Supabase expects this)
- Role for RLS comes from `publicMetadata.role` via helpers above

Client passes token via `session.getToken({ template: 'supabase' })` in `useSupabaseClient()`.

---

## profiles INSERT

Profiles are inserted/updated **only via service role** (webhook, `set-role`, `complete-profile`). No client INSERT policy.

---

## Debugging RLS

1. Confirm Clerk JWT template is named `supabase` and token is sent in Authorization header
2. Test claim extraction: `SELECT auth.jwt();` in SQL editor with impersonation
3. Check role string casing — `'farmer'` ≠ `'Farmer'`
4. UPDATE requires SELECT policy on the same rows (Postgres RLS rule)
5. Run `supabase db advisors` after policy changes

For impersonation testing SQL, see user-role-management [rls.md](../../user-role-management/references/rls.md).
