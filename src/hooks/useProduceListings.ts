import { useUser } from '@clerk/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import type { TablesInsert, TablesUpdate } from '@/lib/database.types';
import {
  createListingId,
  readListings,
  writeListings,
  type StoredProduceListing,
} from '@/lib/listingsStorage';
import type { ProduceListingInput } from '@/lib/schemas/produceListing';
import { mapProduceListing } from '@/lib/supabaseMappers';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

type ListingFilters = {
  crop?: string;
  district?: string;
  quality_grade?: string;
};

export function useActiveListings(filters?: ListingFilters) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['produce_listings', 'active', filters],
    enabled: isSupabaseConfigured(),
    queryFn: async () => {
      let query = client
        .from('produce_listings')
        .select('*, profiles!farmer_id(full_name, district, phone)')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filters?.crop) query = query.ilike('crop_name', `%${filters.crop}%`);
      if (filters?.district) query = query.eq('location', filters.district);
      if (filters?.quality_grade) query = query.eq('quality_grade', filters.quality_grade);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useActiveListingsCount() {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['produce_listings', 'active', 'count'],
    enabled: isSupabaseConfigured(),
    queryFn: async () => {
      const { count, error } = await client
        .from('produce_listings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      if (error) throw error;
      return count ?? 0;
    },
  });
}

function useFarmerListingsQuery(farmerId: string) {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: ['produce_listings', farmerId],
    enabled: !!farmerId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client
        .from('produce_listings')
        .select('*')
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data.map(mapProduceListing);
    },
  });
}

export function useProduceListings() {
  const { user, isLoaded } = useUser();
  const farmerId = user?.id ?? '';
  const client = useSupabaseClient();
  const queryClient = useQueryClient();
  const supabaseEnabled = isSupabaseConfigured();

  const supabaseQuery = useFarmerListingsQuery(farmerId);
  const [localListings, setLocalListings] = useState<StoredProduceListing[]>([]);

  useEffect(() => {
    if (!farmerId || supabaseEnabled) {
      setLocalListings([]);
      return;
    }
    setLocalListings(readListings(farmerId));
  }, [farmerId, supabaseEnabled]);

  const createMutation = useMutation({
    mutationFn: async (input: ProduceListingInput) => {
      const payload: TablesInsert<'produce_listings'> = {
        farmer_id: farmerId,
        crop_name: input.cropName,
        quantity_kg: input.quantityKg,
        unit: input.unit,
        quality_grade: input.qualityGrade,
        price_per_kg_rwf: input.pricePerKgRwf,
        harvest_date: input.harvestDate,
        location: input.location,
        district: input.location,
        status: 'active',
        images: [],
      };

      const { data, error } = await client
        .from('produce_listings')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return mapProduceListing(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client.from('produce_listings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });

  const addListingLocal = useCallback(
    (input: ProduceListingInput): StoredProduceListing | null => {
      if (!farmerId) return null;

      const listing: StoredProduceListing = {
        id: createListingId(),
        farmerId,
        cropName: input.cropName,
        quantityKg: input.quantityKg,
        unit: input.unit,
        harvestDate: input.harvestDate,
        location: input.location,
        qualityGrade: input.qualityGrade,
        pricePerKgRwf: input.pricePerKgRwf,
        images: [],
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const next = [listing, ...readListings(farmerId)];
      writeListings(farmerId, next);
      setLocalListings(next);
      return listing;
    },
    [farmerId],
  );

  const deleteListingLocal = useCallback(
    (id: string) => {
      if (!farmerId) return;
      const next = readListings(farmerId).filter((listing) => listing.id !== id);
      writeListings(farmerId, next);
      setLocalListings(next);
    },
    [farmerId],
  );

  const addListing = useCallback(
    async (input: ProduceListingInput) => {
      if (!farmerId) return null;
      if (supabaseEnabled) {
        return createMutation.mutateAsync(input);
      }
      return addListingLocal(input);
    },
    [farmerId, supabaseEnabled, createMutation, addListingLocal],
  );

  const deleteListing = useCallback(
    async (id: string) => {
      if (!farmerId) return;
      if (supabaseEnabled) {
        await deleteMutation.mutateAsync(id);
        return;
      }
      deleteListingLocal(id);
    },
    [farmerId, supabaseEnabled, deleteMutation, deleteListingLocal],
  );

  const listings = supabaseEnabled
    ? (supabaseQuery.data ?? []).filter((listing) => listing.status === 'active')
    : localListings.filter((listing) => listing.status === 'active');

  const listingsLoaded = supabaseEnabled
    ? !farmerId || !supabaseQuery.isLoading
    : isLoaded;

  return {
    listings,
    addListing,
    deleteListing,
    isLoaded: isLoaded && listingsLoaded,
    canSave: Boolean(farmerId),
    isSaving: createMutation.isPending || deleteMutation.isPending,
  };
}

export function useCreateListing() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: TablesInsert<'produce_listings'>) => {
      const { data, error } = await client
        .from('produce_listings')
        .insert(listing)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });
}

export function useUpdateListing() {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: { id: string } & TablesUpdate<'produce_listings'>) => {
      const { data, error } = await client
        .from('produce_listings')
        .update(update)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produce_listings'] });
    },
  });
}
