import { ROUTES } from '@/lib/routes';

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

export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'Farmer':
      return ROUTES.farmer.root;
    case 'Buyer':
      return ROUTES.buyer.root;
    case 'Cooperative':
      return ROUTES.cooperative;
    case 'Transport':
      return ROUTES.admin.fleet;
    case 'Storage':
      return ROUTES.storage;
    case 'Admin':
      return ROUTES.admin.root;
    default:
      return ROUTES.landing;
  }
}

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}
