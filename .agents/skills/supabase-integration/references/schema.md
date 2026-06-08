# Mavuno Supabase Schema

Canonical source: `PROJECT.md` → Data model. Migration: `supabase/migrations/`.

---

## profiles

| Column | Type | Notes |
|--------|------|-------|
| `clerk_user_id` | text | PK / unique, indexed — Clerk `sub` claim |
| `full_name` | text | |
| `phone` | text | Rwanda format |
| `email` | text | |
| `role` | text | PascalCase: `Farmer`, `Buyer`, etc. |
| `district` | text | |
| `sector` | text | |
| `avatar_url` | text | Supabase Storage URL under `avatars/{clerk_user_id}/` |
| `onboarding_complete` | boolean | default false |
| `is_verified` | boolean | Admin-controlled |
| `is_active` | boolean | default true |
| `created_at` | timestamptz | default now() |

INSERT via service role only (webhook, `set-role`, `complete-profile`).

---

## farms

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `farmer_id` | text | FK → profiles.clerk_user_id |
| `district` | text | |
| `sector` | text | |
| `cell` | text | |
| `gps` | point / jsonb | optional |
| `size_hectares` | numeric | |
| `primary_crops` | text[] | |

---

## produce_listings

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `farmer_id` | text | FK → profiles.clerk_user_id |
| `crop_name` | text | |
| `quantity_kg` | numeric | |
| `quality_grade` | text | from platform config |
| `price_per_kg_rwf` | numeric | |
| `harvest_date` | date | |
| `images` | text[] | public URLs from `produce-images/{listing_id}/` |
| `status` | text | `active`, `archived`, `sold` |
| `location` | text | district/sector |
| `created_at` | timestamptz | |

---

## orders

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `order_ref` | text | generated: `MVN-{YEAR}-{5-digit-seq}` |
| `buyer_id` | text | FK → profiles.clerk_user_id |
| `farmer_id` | text | FK → profiles.clerk_user_id |
| `listing_id` | uuid | FK → produce_listings.id |
| `quantity_kg` | numeric | |
| `total_rwf` | numeric | |
| `status` | text | Pending → Accepted → In Transit → Delivered → Completed |
| `delivery_type` | text | `pickup` or `delivery` |
| `created_at` | timestamptz | |

### order_ref generation

```sql
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

-- Option A: generated column (note: nextval in generated column has caveats — prefer trigger)
-- Option B: BEFORE INSERT trigger (recommended)
CREATE OR REPLACE FUNCTION generate_order_ref()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_ref := 'MVN-' || EXTRACT(YEAR FROM NOW())::text || '-' ||
    LPAD(nextval('order_seq')::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER orders_set_ref
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_ref IS NULL)
  EXECUTE FUNCTION generate_order_ref();
```

---

## order_status_history

| Column | Type |
|--------|------|
| `id` | uuid |
| `order_id` | uuid FK → orders |
| `from_status` | text |
| `to_status` | text |
| `changed_by` | text (clerk_user_id) |
| `created_at` | timestamptz |

---

## notifications

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | text | FK → profiles.clerk_user_id |
| `type` | text | NewOrder, OrderAccepted, DeliveryUpdate, etc. |
| `title` | text | |
| `body` | text | |
| `entity_type` | text | `order`, `listing`, etc. |
| `entity_id` | uuid | |
| `is_read` | boolean | default false |
| `created_at` | timestamptz | |

Realtime channel: `notifications:{user_id}`.

---

## storage_facilities

| Column | Type |
|--------|------|
| `id` | uuid |
| `provider_id` | text FK → profiles |
| `capacity_kg` | numeric |
| `available_kg` | numeric |
| `district` | text |
| `price_per_kg_per_day_rwf` | numeric |

---

## storage_bookings

| Column | Type |
|--------|------|
| `id` | uuid |
| `facility_id` | uuid FK → storage_facilities |
| `farmer_id` | text FK → profiles |
| `crop_name` | text |
| `quantity_kg` | numeric |
| `start_date` | date |
| `end_date` | date |
| `total_cost_rwf` | numeric |
| `status` | text |

---

## cooperative_members (Phase 2)

| Column | Type |
|--------|------|
| `cooperative_id` | text |
| `farmer_id` | text |
| `joined_at` | timestamptz |
| `status` | text |

---

## Storage buckets

| Bucket | Path | Public read |
|--------|------|-------------|
| `produce-images` | `{listing_id}/{filename}` | yes |
| `avatars` | `{clerk_user_id}/{filename}` | yes |

---

## Type generation

After schema changes:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```
