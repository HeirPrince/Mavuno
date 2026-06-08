import { describe, expect, it } from 'vitest';
import { getDashboardPath, isUserRole } from '@/lib/roles';

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
