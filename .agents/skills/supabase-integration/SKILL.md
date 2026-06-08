---
name: supabase-integration
description: >
  Integrates Supabase across the Mavuno stack: client setup, React Query hooks, Storage,
  Realtime, Clerk webhook sync, server-side service role, and RLS. Use for database queries,
  migrations, file uploads, real-time subscriptions, profile sync, or questions like "how do I
  read/write X from Supabase". Triggers include connect app to database, persist data, wire backend,
  file uploads, real-time order updates, Clerk webhook, Supabase Storage bucket. Use proactively
  when data persistence, file storage, or real-time features are part of the task.
---

# Supabase Integration — Mavuno

Mavuno-specific Supabase patterns across client, server, Storage, Realtime, and RLS.

**Stack:** React 19, TypeScript, Vite 6, `@supabase/supabase-js` v2, Express (current API), NestJS (target API), Clerk, React Query, Zod.

Also read the generic [supabase](../supabase/SKILL.md) skill for Supabase-wide security and CLI guidance. For role-based RLS and RBAC, see [user-role-management](../user-role-management/SKILL.md).

## Reference files — read when needed

| File | Read when… |
|------|-----------|
| [references/schema.md](references/schema.md) | Creating/modifying tables, writing migrations, understanding the data model |
| [references/client-patterns.md](references/client-patterns.md) | React hooks, React Query fetches, Storage uploads, Realtime subscriptions |
| [references/server-patterns.md](references/server-patterns.md) | Express `upsertProfile`, Clerk webhook handler, service-role operations; NestJS target patterns |
| [references/rls.md](references/rls.md) | RLS policies — links to canonical migration and user-role-management skill |

---

## Environment variables

```bash
# .env.local (client + server)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # safe for client — only works within RLS

# .env (server only — never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # bypasses RLS — server/webhook use only
CLERK_WEBHOOK_SECRET=whsec_...         # verifies incoming Clerk webhook payloads
```

**RLS must be enabled on every table before `VITE_SUPABASE_ANON_KEY` is used in production.** Without RLS, any authenticated user can read all rows. See [references/rls.md](references/rls.md).

---

## 1 — Client setup

Two clients: React app (anon key + Clerk JWT), server (service role key).

### React client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

Pass the Clerk JWT so RLS can read role and user ID:

```typescript
import { useSession } from '@clerk/react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export function useSupabaseClient() {
  const { session } = useSession();

  return createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({ template: 'supabase' });
          const headers = new Headers(options?.headers);
          if (clerkToken) headers.set('Authorization', `Bearer ${clerkToken}`);
          return fetch(url, { ...options, headers });
        },
      },
    },
  );
}
```

Create a **"supabase" JWT template** in Clerk Dashboard → JWT Templates. Set signing algorithm to HS256 and add `{ "role": "authenticated" }` as base claims. Supabase `auth.jwt()` reads this in RLS policies.

### Generated types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Re-run after every schema change.

---

## 2 — React Query integration

Wrap all Supabase fetches in React Query hooks. Never fetch directly in components.

```typescript
// src/hooks/useProduceListings.ts
import { useQuery } from '@tanstack/react-query';
import { useSupabaseClient } from '@/lib/supabase';

export function useProduceListings(farmerId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['produce_listings', farmerId],
    queryFn: async () => {
      const { data, error } = await client
        .from('produce_listings')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
```

See [references/client-patterns.md](references/client-patterns.md) for Storage, Realtime, and mutation patterns.

**Query key conventions:**

| Scope | Key |
|-------|-----|
| All listings | `['produce_listings']` |
| By farmer | `['produce_listings', farmerId]` |
| Single listing | `['produce_listings', listingId]` |
| Orders by buyer | `['orders', 'buyer', buyerId]` |
| Notifications | `['notifications', userId]` |

Invalidate related keys after mutations — e.g. after creating an order, invalidate `['orders']` and `['produce_listings']`.

---

## 3 — Storage (file uploads)

| Bucket | Path pattern | Access |
|--------|-------------|--------|
| `produce-images` | `{listing_id}/{filename}` | Public read, authenticated write |
| `avatars` | `{clerk_user_id}/{filename}` | Public read, authenticated write (own folder only) |

Set `produce-images` to **public** so listing images load without signed URLs.

---

## 4 — Realtime subscriptions

Used for live order status updates and in-app notification feed.

```typescript
// src/hooks/useNotifications.ts
useEffect(() => {
  const channel = client
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      setUnread((n) => n + 1);
      // invalidate React Query cache
    })
    .subscribe();

  return () => { client.removeChannel(channel); };
}, [userId, client]);
```

See [references/client-patterns.md](references/client-patterns.md) → **Realtime** for order status subscriptions.

---

## 5 — Clerk webhook → profiles sync

On `user.created`, the server webhook handler:
1. Verifies signature with `CLERK_WEBHOOK_SECRET`
2. Upserts `profiles` using the service role key (bypasses RLS)

**Webhook endpoint (Clerk Dashboard):**
```
POST https://your-api.com/api/webhooks/clerk
Events: user.created, user.updated, user.deleted
```

See [references/server-patterns.md](references/server-patterns.md) for Express (current) and NestJS (target) implementations.

---

## 6 — Server-side Supabase access

**Current:** `server/lib/supabase.ts` — `upsertProfile()` via REST + service role key. Used by `server/routes/auth.ts`.

**Target:** NestJS `SupabaseService` injectable with `@supabase/supabase-js` service role client.

Never use the anon key server-side. See [references/server-patterns.md](references/server-patterns.md).

---

## 7 — Order reference generation

Order refs (`MVN-2026-00041`) are generated via PostgreSQL sequence — never client-side.

```sql
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

-- Generated column on orders (or trigger — see references/schema.md)
order_ref TEXT GENERATED ALWAYS AS (
  'MVN-' || EXTRACT(YEAR FROM created_at)::text || '-' ||
  LPAD(nextval('order_seq')::text, 5, '0')
) STORED;
```

---

## 8 — Implementation checklist

When wiring a new feature to Supabase:

- [ ] Table exists with correct columns and FK constraints ([schema.md](references/schema.md))
- [ ] RLS enabled and policies written for every role ([rls.md](references/rls.md))
- [ ] Generated TypeScript types up to date (`npx supabase gen types ...`)
- [ ] React Query hook in `src/hooks/` with correct query key
- [ ] Mutations invalidate related query keys
- [ ] Server endpoint uses service role (`server/lib/supabase.ts` or NestJS `SupabaseService`)
- [ ] Storage bucket exists with correct public/private setting
- [ ] Realtime channel cleaned up in `useEffect` return
