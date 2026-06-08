import { Router } from 'express';
import {
  clerkClient,
  requireClerkAuth,
  type AuthenticatedRequest,
} from '../middleware/clerkAuth.js';
import { completeProfileSchema, setRoleSchema } from '../schemas/auth.js';
import { upsertProfile } from '../lib/supabase.js';

const authRouter = Router();

authRouter.post('/set-role', requireClerkAuth, async (req, res) => {
  if (!clerkClient) {
    res.status(503).json({ error: 'Clerk is not configured.' });
    return;
  }

  const parsed = setRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid role.', details: parsed.error.flatten() });
    return;
  }

  const { userId } = (req as AuthenticatedRequest).auth;
  const { role } = parsed.data;

  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    await upsertProfile({ clerk_user_id: userId, role });

    res.json({ ok: true, role });
  } catch (err) {
    console.error('[auth/set-role]', err);
    res.status(500).json({ error: 'Failed to save role.' });
  }
});

authRouter.post('/complete-profile', requireClerkAuth, async (req, res) => {
  if (!clerkClient) {
    res.status(503).json({ error: 'Clerk is not configured.' });
    return;
  }

  const parsed = completeProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid profile data.', details: parsed.error.flatten() });
    return;
  }

  const { userId } = (req as AuthenticatedRequest).auth;
  const data = parsed.data;

  try {
    const user = await clerkClient.users.getUser(userId);
    const existingRole = user.publicMetadata?.role;
    if (typeof existingRole !== 'string' || !existingRole) {
      res.status(400).json({ error: 'Role must be set before completing profile.' });
      return;
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: existingRole,
        fullName: data.fullName,
        phone: data.phone,
        district: data.district,
        sector: data.sector,
        onboardingComplete: true,
        ...(data.farmSizeHectares !== undefined
          ? { farmSizeHectares: data.farmSizeHectares }
          : {}),
        ...(data.organisationType ? { organisationType: data.organisationType } : {}),
        ...(data.memberCapacity !== undefined ? { memberCapacity: data.memberCapacity } : {}),
      },
    });

    await upsertProfile({
      clerk_user_id: userId,
      role: existingRole,
      full_name: data.fullName,
      phone: data.phone,
      district: data.district,
      sector: data.sector,
      onboarding_complete: true,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[auth/complete-profile]', err);
    res.status(500).json({ error: 'Failed to save profile.' });
  }
});

export default authRouter;
