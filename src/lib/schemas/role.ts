import { z } from 'zod';
import { USER_ROLES } from '@/lib/roles';

/** Roles a user may select at sign-up — Admin is never user-selectable. */
export const SELECTABLE_ROLES = USER_ROLES.filter((r) => r !== 'Admin') as [
  Exclude<(typeof USER_ROLES)[number], 'Admin'>,
  ...(Exclude<(typeof USER_ROLES)[number], 'Admin'>[]),
];

export const selectableRoleSchema = z.enum(SELECTABLE_ROLES, {
  message: 'Select a valid role',
});

export type SelectableRole = z.infer<typeof selectableRoleSchema>;
