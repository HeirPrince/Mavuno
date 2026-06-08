import { z } from 'zod';

/** Must stay in sync with src/lib/schemas/role.ts (Title Case convention). */
export const SELECTABLE_ROLES = [
  'Farmer',
  'Buyer',
  'Cooperative',
  'Transport',
  'Storage',
] as const;

export const setRoleSchema = z.object({
  role: z.enum(SELECTABLE_ROLES),
});

export const completeProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^(\+?250|0)?7[2389]\d{7}$/),
  district: z.string().min(2),
  sector: z.string().min(2),
  farmSizeHectares: z.number().positive().optional(),
  organisationType: z.string().optional(),
  memberCapacity: z.number().int().positive().optional(),
});
