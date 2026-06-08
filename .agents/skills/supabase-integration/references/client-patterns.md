# Client-Side Supabase Patterns (Mavuno)

Requires `useSupabaseClient()` from `src/lib/supabase.ts` (Clerk JWT in Authorization header).

---

## React Query — queries

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/lib/supabase';

export function useMarketplaceListings(filters?: { crop?: string; district?: string }) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['produce_listings', 'marketplace', filters],
    queryFn: async () => {
      let q = client
        .from('produce_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.crop) q = q.ilike('crop_name', `%${filters.crop}%`);
      if (filters?.district) q = q.eq('location', filters.district);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}
```

---

## React Query — mutations

```typescript
export function useCreateOrder() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { listing_id: string; quantity_kg: number; buyer_id: string }) => {
      const { data, error } = await client
        .from('orders')
        .insert({
          listing_id: input.listing_id,
          quantity_kg: input.quantity_kg,
          buyer_id: input.buyer_id,
          status: 'Pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });
}
```

---

## Storage — upload with compression

Compress images client-side before upload (e.g. browser-image-compression) to stay under bucket limits.

```typescript
import imageCompression from 'browser-image-compression';

async function uploadListingImage(
  client: ReturnType<typeof useSupabaseClient>,
  listingId: string,
  file: File,
): Promise<string> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });

  const ext = compressed.name.split('.').pop() ?? 'jpg';
  const path = `${listingId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await client.storage
    .from('produce-images')
    .upload(path, compressed, { upsert: false });

  if (error) throw error;

  const { data } = client.storage.from('produce-images').getPublicUrl(path);
  return data.publicUrl;
}
```

After upload, append URL to `produce_listings.images[]` via update mutation.

### Avatar upload

```typescript
const path = `${clerkUserId}/avatar.${ext}`;
await client.storage.from('avatars').upload(path, file, { upsert: true });
const { data } = client.storage.from('avatars').getPublicUrl(path);
// save data.publicUrl to profiles.avatar_url via server or client update
```

---

## Realtime — order status

```typescript
export function useOrderStatus(orderId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = client
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
        },
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [orderId, client, queryClient]);
}
```

---

## Realtime — notifications

```typescript
export function useNotificationFeed(userId: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

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
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        },
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [userId, client, queryClient]);
}
```

Always call `client.removeChannel(channel)` in the effect cleanup.

---

## Profile read hook

```typescript
export function useProfile() {
  const { user, isLoaded } = useUser();
  const client = useSupabaseClient();

  const query = useQuery({
    queryKey: ['profiles', user?.id],
    enabled: isLoaded && !!user?.id,
    queryFn: async () => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return {
    profile: query.data,
    isLoaded: isLoaded && !query.isLoading,
    onboardingComplete: query.data?.onboarding_complete ?? false,
  };
}
```
