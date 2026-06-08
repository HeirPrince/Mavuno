# Supabase RLS — Role-Based Templates (Mavuno)

Canonical migration: `supabase/migrations/001_role_rls.sql`

**Important:** Mavuno uses **PascalCase** role strings in policies (`'Farmer'`, `'Admin'`), matching Clerk `publicMetadata.role`.

Enable RLS on every table before connecting the anon key:

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

---

## profiles

```sql
CREATE POLICY "profiles: own read"
ON profiles FOR SELECT
USING (clerk_user_id = current_clerk_id());

CREATE POLICY "profiles: own update"
ON profiles FOR UPDATE
USING (clerk_user_id = current_clerk_id());

CREATE POLICY "profiles: admin read all"
ON profiles FOR SELECT
USING (current_user_role() = 'Admin');

-- INSERT via service role in Express webhook/set-role handler only
```

---

## produce_listings

```sql
CREATE POLICY "listings: public read active"
ON produce_listings FOR SELECT
USING (status = 'active');

CREATE POLICY "listings: farmer read own"
ON produce_listings FOR SELECT
USING (current_user_role() = 'Farmer' AND farmer_id = current_clerk_id());

CREATE POLICY "listings: farmer insert"
ON produce_listings FOR INSERT
WITH CHECK (current_user_role() = 'Farmer' AND farmer_id = current_clerk_id());

CREATE POLICY "listings: farmer modify own"
ON produce_listings FOR UPDATE
USING (current_user_role() = 'Farmer' AND farmer_id = current_clerk_id());

CREATE POLICY "listings: admin all"
ON produce_listings FOR ALL
USING (current_user_role() = 'Admin');
```

---

## orders

```sql
CREATE POLICY "orders: farmer read"
ON orders FOR SELECT
USING (current_user_role() = 'Farmer' AND farmer_id = current_clerk_id());

CREATE POLICY "orders: buyer read"
ON orders FOR SELECT
USING (current_user_role() = 'Buyer' AND buyer_id = current_clerk_id());

CREATE POLICY "orders: buyer insert"
ON orders FOR INSERT
WITH CHECK (current_user_role() = 'Buyer' AND buyer_id = current_clerk_id());

CREATE POLICY "orders: farmer update status"
ON orders FOR UPDATE
USING (current_user_role() = 'Farmer' AND farmer_id = current_clerk_id());

CREATE POLICY "orders: buyer update status"
ON orders FOR UPDATE
USING (current_user_role() = 'Buyer' AND buyer_id = current_clerk_id());

CREATE POLICY "orders: admin all"
ON orders FOR ALL
USING (current_user_role() = 'Admin');
```

---

## notifications

```sql
CREATE POLICY "notifications: own read"
ON notifications FOR SELECT
USING (user_id = current_clerk_id());

CREATE POLICY "notifications: own update"
ON notifications FOR UPDATE
USING (user_id = current_clerk_id());

-- INSERT server-side only (service role)
```

---

## storage_facilities / storage_bookings

```sql
CREATE POLICY "storage: public read"
ON storage_facilities FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "storage: provider manage"
ON storage_facilities FOR ALL
USING (current_user_role() = 'Storage' AND provider_id = current_clerk_id());

CREATE POLICY "bookings: farmer read"
ON storage_bookings FOR SELECT
USING (current_user_role() = 'Farmer' AND farmer_id = current_clerk_id());

CREATE POLICY "bookings: provider read"
ON storage_bookings FOR SELECT
USING (
  current_user_role() = 'Storage'
  AND facility_id IN (
    SELECT id FROM storage_facilities WHERE provider_id = current_clerk_id()
  )
);
```

---

## Testing policies

Impersonate JWT claims in the Supabase SQL editor:

```sql
SET LOCAL request.jwt.claims = '{"sub":"clerk_farmer_id","publicMetadata":{"role":"Farmer"}}';
SELECT * FROM produce_listings;  -- only that farmer's rows

SET LOCAL request.jwt.claims = '{"sub":"clerk_buyer_id","publicMetadata":{"role":"Buyer"}}';
SELECT * FROM produce_listings;  -- all active listings

SET LOCAL request.jwt.claims = '{"sub":"clerk_admin_id","publicMetadata":{"role":"Admin"}}';
SELECT * FROM produce_listings;  -- everything
```

Test every role against every table before shipping.
