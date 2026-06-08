import { useUser } from '@clerk/react';
import type { UserRole } from '@/lib/roles';
import { isUserRole } from '@/lib/roles';

export function useRole(): { role: UserRole | null; isLoaded: boolean } {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return { role: null, isLoaded: false };
  }

  const metadataRole = user?.publicMetadata?.role;
  const role = isUserRole(metadataRole) ? metadataRole : null;

  return { role, isLoaded: true };
}
