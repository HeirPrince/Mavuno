import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

export function useOrderRealtime(orderId?: string) {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId || !isSupabaseConfigured()) return;

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
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [orderId, client, queryClient]);
}

/** Invalidate all order queries when any order row changes for the current user. */
export function useOrdersRealtime(userId: string, role: 'Farmer' | 'Buyer') {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  const column = role === 'Farmer' ? 'farmer_id' : 'buyer_id';

  useEffect(() => {
    if (!userId || !isSupabaseConfigured()) return;

    const channel = client
      .channel(`orders:${role}:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `${column}=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [userId, role, column, client, queryClient]);
}
