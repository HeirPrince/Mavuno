import { describe, expect, it } from 'vitest';
import { getRoleHome, ROLE_HOME } from '@/lib/roleRedirect';
import { getDashboardPath, isUserRole } from '@/lib/roles';
import { selectableRoleSchema } from '@/lib/schemas/role';

describe('roles', () => {
  it('maps each role to the correct dashboard path', () => {
    expect(getDashboardPath('Farmer')).toBe('/app/farmer');
    expect(getDashboardPath('Buyer')).toBe('/app/buyer');
    expect(getDashboardPath('Admin')).toBe('/app/admin');
    expect(getDashboardPath('Transport')).toBe('/app/admin/fleet');
    expect(getDashboardPath('Cooperative')).toBe('/app/cooperative');
    expect(getDashboardPath('Storage')).toBe('/app/storage');
  });

  it('validates known user roles', () => {
    expect(isUserRole('Farmer')).toBe(true);
    expect(isUserRole('Admin')).toBe(true);
    expect(isUserRole('invalid')).toBe(false);
  });
});

describe('roleRedirect', () => {
  it('exposes ROLE_HOME for every role', () => {
    expect(Object.keys(ROLE_HOME)).toHaveLength(6);
  });

  it('sends users without a role to onboarding', () => {
    expect(getRoleHome(null)).toBe('/onboarding');
  });

  it('matches getDashboardPath for known roles', () => {
    expect(getRoleHome('Farmer')).toBe(getDashboardPath('Farmer'));
    expect(getRoleHome('Admin')).toBe(getDashboardPath('Admin'));
  });
});

describe('selectableRoleSchema', () => {
  it('accepts user-selectable roles only', () => {
    expect(selectableRoleSchema.safeParse('Farmer').success).toBe(true);
    expect(selectableRoleSchema.safeParse('Admin').success).toBe(false);
  });
});
