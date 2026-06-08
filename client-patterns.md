# Supabase Client Patterns — React / TypeScript

## Table of contents
1. [Client setup](#client-setup)
2. [Produce listings hooks](#produce-listings-hooks)
3. [Orders hooks](#orders-hooks)
4. [Notifications hooks](#notifications-hooks)
5. [Storage — image upload](#storage--image-upload)
6. [Realtime — order status](#realtime--order-status)
7. [Profile hooks](#profile-hooks)
8. [Storage bookings hooks](#storage-bookings-hooks)

---

## Client setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Static client — use for public reads that don't need the user's JWT
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);
```

```typescript
// src/hooks/useSupabaseClient.ts
// Clerk-authenticated client — use for all reads/writes that need RLS context
import { useSession } from '@clerk/react';
import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';
import type { Database } from '@/lib/database.types';

export function useSupabaseClient() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient<Database>(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          global: {
            fetch: async (url, options = {}) => {
              const token = await session?.getToken({ template: 'supabase' });
              const headers = new Headers(options?.headers);
              if (token) headers.set('Authorization', `Bearer ${token}`);
              return fetch(url, { ...options, headers });
            },
          },
        },
      ),
    [session],
  );
}
```

---

## Produce listings hooks

```typescript
// src/hooks/useProduceListings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from './useSupabaseClient';
import type { Database } from '@/lib/database.types';

type ListingInsert = Database['public']['Tables']['produce_listings']['Insert'];
type ListingUpdate = Database['public']['Tables']['produce_listings']['Update'];

// All active listings — used by Marketplace
export function useActiveListings(filters?: {
  crop?: string;
  district?: string;
  quality_grade?: string;
}) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: ['produce_listings', 'active', filters],
    queryFn: async () => {
      let query = client
        .from('produce_listings')
        .select(`*, profiles!farmer_id(full_name, district, phone)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.crop) query = query.ilike('crop_name', `%${filters.crop}%`);
      if (filters?.district) query = query.eq('district', filters.district);
      if (filters?.quality_grade) query = query.eq('quality_grade', filters.quality_grade);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Farmer's own listings
export function useFarmerListings(farmerId: string) {
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
    enabled: !!farmerId,
  });
}

// Create listing
export function useCreateListing() {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listing: ListingInsert) => {
      const { data, error } = await client
        .from('produce_listings')
        .insert(listing)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });
}

// Update listing
export function useUpdateListing() {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...update }: ListingUpdate & { id: string }) => {
      const { data, error } = await client
        .from('produce_listings')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produce_listings'] }),
  });
}
```

---

## Orders hooks

```typescript
// src/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from './useSupabaseClient';
import type { Database } from '@/lib/database.types';

type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderStatus = Database['public']['Enums']['order_status'];

// Buyer's orders
export function useBuyerOrders(buyerId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: ['orders', 'buyer', buyerId],
    queryFn: async () => {
      const { data, error } = await client
        .from('orders')
        .select(`*, produce_listings(crop_name, images), profiles!farmer_id(full_name, phone)`)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!buyerId,
  });
}

// Farmer's incoming orders
export function useFarmerOrders(farmerId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: ['orders', 'farmer', farmerId],
    queryFn: async () => {
      const { data, error } = await client
        .from('orders')
        .select(`*, produce_listings(crop_name, quantity_kg), profiles!buyer_id(full_name, phone)`)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!farmerId,
  });
}

// Place order
export function usePlaceOrder() {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: OrderInsert) => {
      const { data, error } = await client
        .from('orders')
        .insert(order)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });
}

// Update order status (farmer accept/reject, buyer mark complete)
export function useUpdateOrderStatus() {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { data, error } = await client
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
```

---

## Notifications hooks

```typescript
// src/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from './useSupabaseClient';

export function useNotifications(userId: string) {
  const client = useSupabaseClient();
  const qc = useQueryClient();

  // Fetch existing notifications
  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Live subscription — new notifications appear instantly
  useEffect(() => {
    if (!userId) return;
    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [userId, client, qc]);

  // Mark as read
  const markRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await client
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  });

  const unreadCount = query.data?.filter((n) => !n.is_read).length ?? 0;

  return { ...query, unreadCount, markRead };
}
```

---

## Storage — image upload

```typescript
// src/lib/uploadImage.ts
import { supabase } from './supabase';

// Compress image client-side before upload (keeps Storage costs low)
async function compressImage(file: File, maxKB = 500): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, Math.sqrt((maxKB * 1024) / file.size));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.85);
    };
  });
}

export async function uploadListingImage(
  listingId: string,
  file: File,
): Promise<string> {
  const compressed = await compressImage(file);
  const ext = 'webp';
  const path = `${listingId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('produce-images')
    .upload(path, compressed, { contentType: 'image/webp', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('produce-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(clerkUserId: string, file: File): Promise<string> {
  const compressed = await compressImage(file, 200);
  const path = `${clerkUserId}/avatar.webp`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, compressed, { contentType: 'image/webp', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}
```

Usage in a listing form:

```typescript
const imageUrls: string[] = [];
for (const file of selectedFiles) {
  const url = await uploadListingImage(listingId, file);
  imageUrls.push(url);
}
// Then include imageUrls in the listing insert payload
```

---

## Realtime — order status

```typescript
// src/hooks/useOrderRealtime.ts
// Subscribes to status changes on a specific order (for tracking page)
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from './useSupabaseClient';

export function useOrderRealtime(orderId: string) {
  const client = useSupabaseClient();
  const qc = useQueryClient();

  useEffect(() => {
    if (!orderId) return;
    const channel = client
      .channel(`order:${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['orders'] });
        },
      )
      .subscribe();

    return () => { client.removeChannel(channel); };
  }, [orderId, client, qc]);
}
```

---

## Profile hooks

```typescript
// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from './useSupabaseClient';
import type { Database } from '@/lib/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export function useProfile(clerkUserId: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: ['profiles', clerkUserId],
    queryFn: async () => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!clerkUserId,
  });
}

export function useUpdateProfile() {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ clerkUserId, ...update }: ProfileUpdate & { clerkUserId: string }) => {
      const { data, error } = await client
        .from('profiles')
        .update(update)
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ['profiles', data.clerk_user_id] }),
  });
}
```

---

## Storage bookings hooks

```typescript
// src/hooks/useStorageBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from './useSupabaseClient';
import type { Database } from '@/lib/database.types';

type BookingInsert = Database['public']['Tables']['storage_bookings']['Insert'];

export function useStorageFacilities(district?: string) {
  const client = useSupabaseClient();
  return useQuery({
    queryKey: ['storage_facilities', district],
    queryFn: async () => {
      let query = client
        .from('storage_facilities')
        .select(`*, profiles!provider_id(full_name, phone)`)
        .eq('is_active', true)
        .gt('available_kg', 0);
      if (district) query = query.eq('district', district);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBooking() {
  const client = useSupabaseClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: BookingInsert) => {
      const { data, error } = await client
        .from('storage_bookings')
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storage_facilities'] });
      qc.invalidateQueries({ queryKey: ['storage_bookings'] });
    },
  });
}
```
