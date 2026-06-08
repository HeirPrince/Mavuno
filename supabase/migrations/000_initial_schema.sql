-- Mavuno base schema (Phase 1)
-- Run BEFORE 001_role_rls.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared trigger helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Order reference sequence (MVN-2026-00001)
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_ref()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.order_ref IS NULL THEN
    NEW.order_ref := 'MVN-' ||
      EXTRACT(YEAR FROM NOW())::TEXT || '-' ||
      LPAD(nextval('order_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles (Clerk user_id is the primary key)
-- INSERT via service role only (webhook, set-role, complete-profile)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  clerk_user_id       TEXT PRIMARY KEY,
  full_name           TEXT,
  phone               TEXT,
  email               TEXT,
  role                TEXT,                    -- PascalCase: Farmer, Buyer, Admin, …
  district            TEXT,
  sector              TEXT,
  avatar_url          TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON profiles(district);

-- ---------------------------------------------------------------------------
-- farms
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  district        TEXT NOT NULL,
  sector          TEXT,
  cell            TEXT,
  gps_lat         DECIMAL(10, 8),
  gps_lng         DECIMAL(11, 8),
  size_hectares   DECIMAL(10, 2),
  primary_crops   TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON farms(farmer_id);

-- ---------------------------------------------------------------------------
-- produce_listings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produce_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id         TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  crop_name         TEXT NOT NULL,
  quantity_kg       DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
  unit              TEXT NOT NULL DEFAULT 'kg',
  quality_grade     TEXT NOT NULL,
  price_per_kg_rwf  INTEGER NOT NULL CHECK (price_per_kg_rwf > 0),
  harvest_date      DATE,
  location          TEXT,
  district          TEXT,
  images            TEXT[] NOT NULL DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'sold', 'archived')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER produce_listings_updated_at
  BEFORE UPDATE ON produce_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_listings_farmer_id ON produce_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON produce_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_district ON produce_listings(district);
CREATE INDEX IF NOT EXISTS idx_listings_crop_name ON produce_listings(crop_name);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref       TEXT UNIQUE,
  buyer_id        TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  listing_id      UUID NOT NULL REFERENCES produce_listings(id),
  farmer_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  quantity_kg     DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
  total_rwf       INTEGER NOT NULL CHECK (total_rwf > 0),
  status          TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN (
                    'Pending', 'Accepted', 'In Transit',
                    'Delivered', 'Completed', 'Cancelled'
                  )),
  delivery_type   TEXT NOT NULL DEFAULT 'delivery'
                  CHECK (delivery_type IN ('delivery', 'pickup')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_set_ref
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_ref();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ---------------------------------------------------------------------------
-- order_status_history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status   TEXT,
  to_status     TEXT NOT NULL,
  changed_by    TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON order_status_history(order_id);

-- ---------------------------------------------------------------------------
-- storage_facilities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage_facilities (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id               TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  name                      TEXT NOT NULL,
  facility_type             TEXT NOT NULL DEFAULT 'dry',
  capacity_kg               INTEGER NOT NULL CHECK (capacity_kg > 0),
  available_kg              INTEGER NOT NULL CHECK (available_kg >= 0),
  district                  TEXT NOT NULL,
  price_per_kg_per_day_rwf  INTEGER NOT NULL CHECK (price_per_kg_per_day_rwf > 0),
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER storage_facilities_updated_at
  BEFORE UPDATE ON storage_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_facilities_district ON storage_facilities(district);
CREATE INDEX IF NOT EXISTS idx_facilities_provider_id ON storage_facilities(provider_id);

-- ---------------------------------------------------------------------------
-- storage_bookings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id     UUID NOT NULL REFERENCES storage_facilities(id),
  farmer_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id),
  crop_name       TEXT NOT NULL,
  quantity_kg     DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_cost_rwf  INTEGER NOT NULL CHECK (total_cost_rwf > 0),
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN (
                    'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'
                  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE TRIGGER storage_bookings_updated_at
  BEFORE UPDATE ON storage_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_bookings_facility_id ON storage_bookings(facility_id);
CREATE INDEX IF NOT EXISTS idx_bookings_farmer_id ON storage_bookings(farmer_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL REFERENCES profiles(clerk_user_id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Realtime (optional — safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
EXCEPTION
  WHEN undefined_object THEN NULL; -- publication may not exist on all projects
END;
$$;
