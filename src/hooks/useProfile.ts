import { useUser } from '@clerk/react';
import { useMemo } from 'react';
import type { UserRole } from '@/lib/roles';
import { isUserRole } from '@/lib/roles';

const PROFILE_STORAGE_KEY = 'mavuno_profile';
const PENDING_ROLE_KEY = 'mavuno_pending_role';

export interface LocalProfile {
  role: UserRole;
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
    if (!parsed || !isUserRole(parsed.role)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: LocalProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function getPendingRole(): UserRole | null {
  const value = sessionStorage.getItem(PENDING_ROLE_KEY);
  return isUserRole(value) ? value : null;
}

export function setPendingRole(role: UserRole) {
  sessionStorage.setItem(PENDING_ROLE_KEY, role);
}

export function clearPendingRole() {
  sessionStorage.removeItem(PENDING_ROLE_KEY);
}

export function useProfile() {
  const { user, isLoaded } = useUser();

  const profile = useMemo(() => {
    const local = readLocalProfile();
    const metadata = user?.unsafeMetadata ?? user?.publicMetadata ?? {};
    const metadataRole = metadata.role;
    const role = isUserRole(metadataRole)
      ? metadataRole
      : local?.role ?? getPendingRole() ?? 'Admin';

    const onboardingComplete =
      metadata.onboardingComplete === true || local?.onboardingComplete === true;

    return {
      role,
      fullName: (metadata.fullName as string | undefined) ?? local?.fullName ?? user?.fullName ?? '',
      phone: (metadata.phone as string | undefined) ?? local?.phone ?? '',
      district: (metadata.district as string | undefined) ?? local?.district ?? '',
      sector: (metadata.sector as string | undefined) ?? local?.sector ?? '',
      onboardingComplete,
      email: user?.primaryEmailAddress?.emailAddress ?? '',
    };
  }, [user]);

  return { profile, isLoaded, user };
}
