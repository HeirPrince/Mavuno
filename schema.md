# Mavuno — Supabase Database Schema

## Table of contents
1. [profiles](#profiles)
2. [farms](#farms)
3. [produce_listings](#produce_listings)
4. [orders](#orders)
5. [order_status_history](#order_status_history)
6. [cooperative_members](#cooperative_members)
7. [storage_facilities](#storage_facilities)
8. [storage_bookings](#storage_bookings)
9. [notifications](#notifications)
10. [Enums](#enums)
11. [Indexes](#indexes)
12. [Migration order](#migration-order)

---

## Enums

Define all enums first — tables reference them.

```sql
CREATE TYPE user_role AS ENUM (
  'farmer', 'buyer', 'cooperative', 'transport', 'storage', 'admin'
);

CREATE TYPE user_status AS ENUM (
  'Verified', 'Pending', 'Flagged', 'Suspended'
);

CREATE TYPE listing_status AS ENUM (
  'active', 'sold', 'archived'
);

CREATE TYPE order_status AS ENUM (
  'Pending', 'Accepted', 'In Transit', 'Delivered', 'Completed', 'Cancelled'
);

CREATE TYPE delivery_type AS ENUM (
  'delivery', 'pickup'
);

CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'
);

CREATE TYPE notification_type AS ENUM (
  'New Order', 'Order Accepted', 'Delivery Update', 'Market Alert', 'Weather Alert'
);
```

---

## profiles

```sql
CREATE TABLE profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id     TEXT NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  phone             TEXT,
  email             TEXT NOT NULL,
  role              user_role NOT NULL,
  district          TEXT,
  sector            TEXT,
  avatar_url        TEXT,                    -- Supabase Storage: avatars/{clerk_user_id}/
  is_verified       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  status            user_status NOT NULL DEFAULT 'Pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## farms

```sql
CREATE TABLE farms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  district        TEXT NOT NULL,
  sector          TEXT,
  cell            TEXT,
  gps_lat         DECIMAL(10,8),
  gps_lng         DECIMAL(11,8),
  size_hectares   DECIMAL(10,2),
  primary_crops   TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## produce_listings

```sql
-- Sequence for display ordering (not the order_ref sequence)
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE TABLE produce_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id         TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  crop_name         TEXT NOT NULL,
  quantity_kg       DECIMAL(10,2) NOT NULL CHECK (quantity_kg > 0),
  unit              TEXT NOT NULL DEFAULT 'kg',
  quality_grade     TEXT NOT NULL,           -- references PlatformConfig grades
  price_per_kg_rwf  INTEGER NOT NULL CHECK (price_per_kg_rwf > 0),
  harvest_date      DATE,
  location          TEXT,
  district          TEXT,
  images            TEXT[] DEFAULT '{}',     -- Supabase Storage public URLs
  status            listing_status NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON produce_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## orders

```sql
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref       TEXT UNIQUE,               -- set by trigger: MVN-{YEAR}-{5-digit-seq}
  buyer_id        TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  listing_id      UUID NOT NULL REFERENCES produce_listings(id),
  farmer_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  quantity_kg     DECIMAL(10,2) NOT NULL CHECK (quantity_kg > 0),
  total_rwf       INTEGER NOT NULL CHECK (total_rwf > 0),
  commission_rwf  INTEGER NOT NULL DEFAULT 0,
  status          order_status NOT NULL DEFAULT 'Pending',
  delivery_type   delivery_type NOT NULL DEFAULT 'delivery',
  delivery_address TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generate order_ref on insert
CREATE OR REPLACE FUNCTION generate_order_ref()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_ref := 'MVN-' ||
    EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
    LPAD(nextval('order_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_ref
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_ref();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## order_status_history

```sql
CREATE TABLE order_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   order_status,
  to_status     order_status NOT NULL,
  changed_by    TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## cooperative_members

```sql
CREATE TABLE cooperative_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id  TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  farmer_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'active',
  UNIQUE (cooperative_id, farmer_id)
);
```

---

## storage_facilities

```sql
CREATE TABLE storage_facilities (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id               TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  facility_type             TEXT NOT NULL,   -- 'cold', 'dry', 'silo'
  capacity_kg               INTEGER NOT NULL CHECK (capacity_kg > 0),
  available_kg              INTEGER NOT NULL CHECK (available_kg >= 0),
  district                  TEXT NOT NULL,
  address                   TEXT,
  price_per_kg_per_day_rwf  INTEGER NOT NULL CHECK (price_per_kg_per_day_rwf > 0),
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER facilities_updated_at
  BEFORE UPDATE ON storage_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## storage_bookings

```sql
CREATE TABLE storage_bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id   UUID NOT NULL REFERENCES storage_facilities(id),
  farmer_id     TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  crop_name     TEXT NOT NULL,
  quantity_kg   DECIMAL(10,2) NOT NULL CHECK (quantity_kg > 0),
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  total_cost_rwf INTEGER NOT NULL CHECK (total_cost_rwf > 0),
  status        booking_status NOT NULL DEFAULT 'pending',
  CHECK (end_date > start_date),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON storage_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## notifications

```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  entity_type   TEXT,                        -- 'order', 'listing', 'booking', etc.
  entity_id     UUID,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Indexes

```sql
-- profiles
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX idx_profiles_role          ON profiles(role);
CREATE INDEX idx_profiles_district      ON profiles(district);

-- produce_listings
CREATE INDEX idx_listings_farmer_id  ON produce_listings(farmer_id);
CREATE INDEX idx_listings_status     ON produce_listings(status);
CREATE INDEX idx_listings_district   ON produce_listings(district);
CREATE INDEX idx_listings_crop_name  ON produce_listings(crop_name);

-- orders
CREATE INDEX idx_orders_buyer_id   ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id  ON orders(farmer_id);
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_orders_status     ON orders(status);

-- notifications
CREATE INDEX idx_notifications_user_id  ON notifications(user_id);
CREATE INDEX idx_notifications_is_read  ON notifications(is_read);

-- storage
CREATE INDEX idx_facilities_district    ON storage_facilities(district);
CREATE INDEX idx_bookings_facility_id   ON storage_bookings(facility_id);
CREATE INDEX idx_bookings_farmer_id     ON storage_bookings(farmer_id);
```

---

## Migration order

Run in this order to respect FK dependencies:

1. Enums
2. `update_updated_at` function
3. `order_seq` sequence
4. `profiles`
5. `farms`
6. `produce_listings`
7. `orders` (+ trigger)
8. `order_status_history`
9. `cooperative_members`
10. `storage_facilities`
11. `storage_bookings`
12. `notifications`
13. Indexes
14. RLS policies (see `references/rls.md`)

---

## Regenerate TypeScript types after schema changes

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  --schema public \
  > src/lib/database.types.ts
```

Import in queries:
```typescript
import type { Database } from '@/lib/database.types';
// Tables are then: Database['public']['Tables']['orders']['Row']
```
