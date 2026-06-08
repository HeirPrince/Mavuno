import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import type { OrderStatus, TablesInsert } from '@/lib/database.types';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

export function useBuyerOrders(buyerId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['orders', 'buyer', buyerId],
    enabled: !!buyerId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client
        .from('orders')
        .select('*, produce_listings(crop_name, images), profiles!farmer_id(full_name, phone)')
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useFarmerOrders(farmerId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['orders', 'farmer', farmerId],
    enabled: !!farmerId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client
        .from('orders')
        .select('*, produce_listings(crop_name, quantity_kg), profiles!buyer_id(full_name, phone)')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function usePlaceOrder() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: TablesInsert<'orders'>) => {
      const { data, error } = await client.from('orders').insert(order).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrderStats(userId: string, role: 'Farmer' | 'Buyer') {
  const client = useSupabaseClient();
  const column = role === 'Farmer' ? 'farmer_id' : 'buyer_id';

  return useQuery({
    queryKey: ['orders', 'stats', role, userId],
    enabled: !!userId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client.from('orders').select('status, total_rwf').eq(column, userId);
      if (error) throw error;

      const rows = data ?? [];
      const active = rows.filter(
        (o) => o.status !== 'Completed' && o.status !== 'Cancelled',
      ).length;
      const inDelivery = rows.filter((o) => o.status === 'In Transit').length;
      const revenue = rows
        .filter((o) => o.status === 'Completed')
        .reduce((sum, o) => sum + Number(o.total_rwf), 0);

      return { total: rows.length, active, inDelivery, revenue };
    },
  });
}
