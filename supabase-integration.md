---
name: supabase-integration
description: >
  Use this skill for any task that touches Supabase in the Mavuno project. Triggers include:
  setting up the Supabase client, writing or running database queries, creating or modifying
  tables, writing migrations, implementing Supabase Realtime subscriptions, uploading or
  retrieving files from Supabase Storage, syncing Clerk users to the profiles table via
  webhooks, writing or debugging Row Level Security (RLS) policies, using the Supabase
  service role key in NestJS, integrating React Query with Supabase fetches, or any question
  involving "how do I read/write X from Supabase". Also triggers for: "connect the app to
  the database", "persist data", "wire up the backend", "set up file uploads", "real-time
  order updates", "Clerk webhook", or "Supabase Storage bucket". Use proactively whenever
  data persistence, file storage, or real-time features are part of the task — even as a
  side concern.
compatibility: >
  React 19, TypeScript, Vite 6, @supabase/supabase-js v2, NestJS, Clerk (@clerk/react +
  clerk-sdk-node), React Query (@tanstack/react-query), Zod
---

# Supabase Integration — Mavuno

This skill covers every layer of Supabase in the Mavuno stack: client setup, database
queries with React Query, Storage uploads, Realtime subscriptions, Clerk webhook sync,
NestJS service-role access, and RLS.

## Reference files — read when needed

| File | Read when… |
|------|-----------|
| `references/schema.md` | Creating/modifying tables, writing migrations, understanding the full data model |
| `references/client-patterns.md` | Writing React hooks, React Query fetches, Storage uploads, Realtime subscriptions |
| `references/nestjs-patterns.md` | NestJS SupabaseService, Clerk webhook handler, service-role operations |
| `references/rls.md` | Writing or debugging RLS policies (already covered in user-role-management skill — reference here for Supabase-specific context) |

---

## Environment variables

```bash
# .env.local (client + server)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # safe for client — only works within RLS

# .env (server only — never expose to client)
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # bypasses RLS — NestJS/webhook use only
CLERK_WEBHOOK_SECRET=whsec_...         # verifies incoming Clerk webhook payloads
```

⚠️ **RLS must be enabled on every table before `VITE_SUPABASE_ANON_KEY` is used in production.** Without RLS, any authenticated user can read all rows. See `references/rls.md`.

---

## 1 — Client setup

Two clients: one for the React app (anon key + Clerk JWT), one for NestJS (service role key).

### React client (`src/lib/supabase.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

To pass the Clerk JWT so RLS policies can read the user's role and ID:

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

> You must create a **"supabase" JWT template** in Clerk Dashboard → JWT Templates. Set the signing algorithm to HS256 and add `{ "role": "authenticated" }` as the base claims. This is what Supabase's `auth.jwt()` reads in RLS policies.

### Generated types

Always use generated types for type-safe queries:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Re-run after every schema change.

---

## 2 — React Query integration

Wrap all Supabase fetches in React Query hooks. Never fetch directly in components.

**Pattern:**

```typescript
// src/hooks/useProduceListings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

See `references/client-patterns.md` for full hook examples for every table.

**Query key conventions:**

| Scope | Key |
|-------|-----|
| All listings | `['produce_listings']` |
| By farmer | `['produce_listings', farmerId]` |
| Single listing | `['produce_listings', listingId]` |
| Orders by buyer | `['orders', 'buyer', buyerId]` |
| Notifications | `['notifications', userId]` |

Invalidate related keys after mutations — e.g. after creating an order, invalidate `['orders']` and `['produce_listings']` (quantity may change).

---

## 3 — Storage (file uploads)

Two buckets:

| Bucket | Path pattern | Access |
|--------|-------------|--------|
| `produce-images` | `{listing_id}/{filename}` | Public read, authenticated write |
| `avatars` | `{clerk_user_id}/{filename}` | Public read, authenticated write (own folder only) |

Create buckets in Supabase Dashboard → Storage, or via migration. Set `produce-images` to **public** so listing images load without a signed URL.

See `references/client-patterns.md` → **Storage** for the full upload/retrieve pattern including client-side image compression before upload.

---

## 4 — Realtime subscriptions

Used for: live order status updates, in-app notification feed.

**Pattern (notifications channel):**

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/supabase';

export function useNotifications(userId: string) {
  const client = useSupabaseClient();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnread((n) => n + 1);
          // also invalidate React Query cache
        },
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [userId, client]);

  return { unread };
}
```

See `references/client-patterns.md` → **Realtime** for order status subscriptions.

---

## 5 — Clerk webhook → profiles sync

When a user registers, Clerk fires `user.created`. The NestJS webhook handler:
1. Verifies the webhook signature with `CLERK_WEBHOOK_SECRET`
2. Upserts a row in `profiles` using the service role key (bypasses RLS)

See `references/nestjs-patterns.md` → **Clerk Webhook Handler** for the full implementation.

**Webhook endpoint to register in Clerk Dashboard:**
```
POST https://your-api.com/api/webhooks/clerk
Events: user.created, user.updated, user.deleted
```

---

## 6 — NestJS SupabaseService

Use the service role client in NestJS for all server-side writes (webhook syncs, admin operations, order ref generation). Never use the anon key server-side.

See `references/nestjs-patterns.md` → **SupabaseService** for the injectable NestJS service.

---

## 7 — Order reference generation

Order refs (`MVN-2026-00041`) are generated via a PostgreSQL sequence — never client-side.

```sql
-- Run once in a migration
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

-- Generated column on the orders table
order_ref TEXT GENERATED ALWAYS AS (
  'MVN-' || EXTRACT(YEAR FROM created_at)::text || '-' ||
  LPAD(nextval('order_seq')::text, 5, '0')
) STORED;
```

Or generate in the INSERT trigger — see `references/schema.md` → **orders table**.

---

## 8 — Implementation checklist

When wiring a new feature to Supabase, verify:

- [ ] Table exists with correct columns and FK constraints (`references/schema.md`)
- [ ] RLS enabled and policies written for every role that touches the table (`references/rls.md`)
- [ ] Generated TypeScript types are up to date (`npx supabase gen types ...`)
- [ ] React Query hook created in `src/hooks/` with correct query key
- [ ] Mutations invalidate related query keys
- [ ] NestJS endpoint uses `SupabaseService` (service role), not the client-side instance
- [ ] Storage bucket exists and has correct public/private setting
- [ ] Realtime channel cleaned up in `useEffect` return
