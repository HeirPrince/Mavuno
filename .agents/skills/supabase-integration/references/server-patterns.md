# Server-Side Supabase Patterns (Mavuno)

Use the **service role key** for all server writes. Never expose it to the client.

---

## Current — Express (`server/lib/supabase.ts`)

Profile upsert via REST API (works before `@supabase/supabase-js` is added to server):

```typescript
const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim() ?? process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export async function upsertProfile(row: ProfileUpsert): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const res = await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=clerk_user_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey!,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn('[supabase] profile upsert failed:', res.status, text);
  }
}
```

Used by `server/routes/auth.ts` on `POST /api/auth/set-role` and `POST /api/auth/complete-profile`.

### Upgrade path

Replace REST fetch with `@supabase/supabase-js` service client when adding more tables:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
```

---

## Clerk webhook handler (Express)

Register in Clerk Dashboard:
```
POST https://your-api.com/api/webhooks/clerk
Events: user.created, user.updated, user.deleted
```

```typescript
import { Webhook } from 'svix';
import { upsertProfile } from '../lib/supabase.js';

router.post('/webhooks/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let evt;
  try {
    evt = wh.verify(req.body, {
      'svix-id': req.headers['svix-id'] as string,
      'svix-timestamp': req.headers['svix-timestamp'] as string,
      'svix-signature': req.headers['svix-signature'] as string,
    });
  } catch {
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  const { type, data } = evt as { type: string; data: Record<string, unknown> };

  if (type === 'user.created' || type === 'user.updated') {
    const id = data.id as string;
    const email = (data.email_addresses as { email_address: string }[])?.[0]?.email_address;
    const firstName = data.first_name as string | undefined;
    const lastName = data.last_name as string | undefined;

    await upsertProfile({
      clerk_user_id: id,
      full_name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
      email,
    });
  }

  if (type === 'user.deleted') {
    // soft-delete or hard-delete profiles row via service role
  }

  res.json({ ok: true });
});
```

Use `express.raw()` for the webhook route only — JSON parser breaks signature verification.

---

## Target — NestJS SupabaseService

```typescript
// supabase.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/database.types';

@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient<Database>;

  constructor() {
    this.client = createClient<Database>(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }

  async upsertProfile(row: Database['public']['Tables']['profiles']['Insert']) {
    const { error } = await this.client
      .from('profiles')
      .upsert(row, { onConflict: 'clerk_user_id' });
    if (error) throw error;
  }
}
```

Inject `SupabaseService` in webhook handlers, admin routes, and any operation that bypasses RLS (notifications insert, order ref triggers, admin reads).

---

## When to use service role vs client

| Operation | Client (anon + JWT) | Service role |
|-----------|---------------------|--------------|
| Farmer reads own listings | yes | no |
| Buyer creates order | yes (RLS permits) | no |
| Webhook creates profile | no | yes |
| Admin reads all users | no | yes |
| Insert notification on order event | no | yes (server trigger or API) |
| Generate order_ref | no | DB trigger only |
