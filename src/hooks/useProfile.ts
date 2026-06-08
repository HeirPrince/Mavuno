import { useUser } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRole } from '@/hooks/useRole';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { isSupabaseConfigured } from '@/lib/supabaseConfig';

const PROFILE_STORAGE_KEY = 'mavuno_profile';

export interface LocalProfile {
  fullName?: string;
  phone?: string;
  district?: string;
  sector?: string;
  onboardingComplete: boolean;
}

function readLocalProfile(): LocalProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalProfile;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Cache profile locally when Supabase is unavailable or after server save. */
export function saveLocalProfile(profile: LocalProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export interface AppProfile {
  role: ReturnType<typeof useRole>['role'];
  fullName: string;
  phone: string;
  district: string;
  sector: string;
  onboardingComplete: boolean;
  email: string;
  avatarUrl?: string;
}

export function useProfile() {
  const { user, isLoaded } = useUser();
  const { role } = useRole();
  const client = useSupabaseClient();
  const userId = user?.id;

  const supabaseQuery = useQuery({
    queryKey: ['profiles', userId],
    enabled: isLoaded && !!userId && isSupabaseConfigured(),
    queryFn: async () => {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('clerk_user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const profile = useMemo((): AppProfile => {
    const local = readLocalProfile();
    const metadata = user?.publicMetadata ?? {};
    const db = supabaseQuery.data;

    return {
      role,
      fullName:
        db?.full_name ??
        (metadata.fullName as string | undefined) ??
        local?.fullName ??
        user?.fullName ??
        '',
      phone: db?.phone ?? (metadata.phone as string | undefined) ?? local?.phone ?? '',
      district:
        db?.district ?? (metadata.district as string | undefined) ?? local?.district ?? '',
      sector: db?.sector ?? (metadata.sector as string | undefined) ?? local?.sector ?? '',
      onboardingComplete:
        db?.onboarding_complete === true ||
        metadata.onboardingComplete === true ||
        local?.onboardingComplete === true,
      email: db?.email ?? user?.primaryEmailAddress?.emailAddress ?? '',
      avatarUrl: db?.avatar_url ?? user?.imageUrl ?? undefined,
    };
  }, [user, role, supabaseQuery.data]);

  const profileLoaded =
    isLoaded && (!userId || !isSupabaseConfigured() || !supabaseQuery.isLoading);

  return { profile, isLoaded: profileLoaded, user, refetchProfile: supabaseQuery.refetch };
}
