import { getRoleHome } from '@/lib/roleRedirect';

export const USER_ROLES = [
  'Farmer',
  'Buyer',
  'Cooperative',
  'Transport',
  'Storage',
  'Admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  Farmer: 'Farmer',
  Buyer: 'Buyer',
  Cooperative: 'Cooperative',
  Transport: 'Transport Provider',
  Storage: 'Storage Provider',
  Admin: 'Admin',
};

/** @deprecated Prefer getRoleHome from @/lib/roleRedirect */
export function getDashboardPath(role: UserRole): string {
  return getRoleHome(role);
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}
