import { describe, expect, it } from 'vitest';
import { profileSetupSchema } from '@/lib/schemas/profile';

describe('profileSetupSchema', () => {
  it('accepts valid profile data', () => {
    const result = profileSetupSchema.safeParse({
      fullName: 'Jean Mukamana',
      phone: '+250788123456',
      email: 'jean@example.com',
      district: 'Musanze',
      sector: 'Kinigi',
      role: 'Farmer',
      farmSizeHectares: 2.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    const result = profileSetupSchema.safeParse({
      fullName: 'Jean Mukamana',
      phone: '12345',
      email: 'jean@example.com',
      district: 'Musanze',
      sector: 'Kinigi',
      role: 'Farmer',
    });
    expect(result.success).toBe(false);
  });
});
