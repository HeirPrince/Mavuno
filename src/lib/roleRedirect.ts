import type { UserRole } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';

export const ROLE_HOME: Record<UserRole, string> = {
  Farmer: ROUTES.farmer.root,
  Buyer: ROUTES.buyer.root,
  Cooperative: ROUTES.cooperative,
  Transport: ROUTES.admin.fleet,
  Storage: ROUTES.storage,
  Admin: ROUTES.admin.root,
};

export function getRoleHome(role: UserRole | null): string {
  if (!role) return ROUTES.onboarding;
  return ROLE_HOME[role];
}
