import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import type { TablesInsert } from '@/lib/database.types';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

export function useStorageFacilities(district?: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['storage_facilities', district],
    enabled: isSupabaseConfigured(),
    queryFn: async () => {
      let query = client
        .from('storage_facilities')
        .select('*, profiles!provider_id(full_name, phone)')
        .eq('is_active', true)
        .gt('available_kg', 0);

      if (district) query = query.eq('district', district);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useFarmerStorageBookings(farmerId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['storage_bookings', 'farmer', farmerId],
    enabled: !!farmerId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client
        .from('storage_bookings')
        .select('*, storage_facilities(name, district)')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBooking() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: TablesInsert<'storage_bookings'>) => {
      const { data, error } = await client
        .from('storage_bookings')
        .insert(booking)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage_facilities'] });
      queryClient.invalidateQueries({ queryKey: ['storage_bookings'] });
    },
  });
}
