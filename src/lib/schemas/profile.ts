import { z } from 'zod';
import { USER_ROLES } from '@/lib/roles';
import { RWANDA_DISTRICTS } from '@/lib/rwanda';

export const profileSetupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),
  phone: z
    .string()
    .regex(/^(\+?250|0)?7[2389]\d{7}$/, 'Enter a valid Rwanda phone number'),
  email: z.string().email('Enter a valid email address'),
  district: z.enum(RWANDA_DISTRICTS, { message: 'Select a district' }),
  sector: z.string().min(2, 'Select a sector'),
  role: z.enum(USER_ROLES, { message: 'Select a user type' }),
  farmSizeHectares: z.coerce.number().positive().optional(),
  organisationType: z.string().optional(),
  memberCapacity: z.coerce.number().int().positive().optional(),
});

export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
