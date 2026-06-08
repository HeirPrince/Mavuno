# Role Management — Mavuno Code Patterns

All roles use **PascalCase** (`Farmer`, not `farmer`).

---

## RoleSelector component

`src/components/RoleSelector.tsx` — validates with Zod, calls `POST /api/auth/set-role` with Clerk session token.

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { selectableRoleSchema } from '@/lib/schemas/role';
import { ROLE_LABELS, type UserRole } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';

const SELECTABLE = (['Farmer', 'Buyer', 'Cooperative', 'Transport', 'Storage'] as const);

export function RoleSelector() {
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  async function handleSubmit() {
    const result = selectableRoleSchema.safeParse(selected);
    if (!result.success) {
      setError('Please select a role to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: result.data }),
      });
      if (!res.ok) throw new Error('Failed to save role');
      navigate(`${ROUTES.onboarding}?step=profile`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">What describes you best?</h2>
      <div className="grid gap-3">
        {SELECTABLE.map((value) => (
          <button key={value} onClick={() => setSelected(value)} /* ... */>
            <div className="font-medium">{ROLE_LABELS[value]}</div>
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button onClick={handleSubmit} disabled={!selected || loading}>
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </div>
  );
}
```

---

## useRole hook

`src/hooks/useRole.ts`:

```typescript
import { useUser } from '@clerk/react';
import type { UserRole } from '@/lib/roles';
import { isUserRole } from '@/lib/roles';

export function useRole(): { role: UserRole | null; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return { role: null, isLoaded: false };
  const metadataRole = user?.publicMetadata?.role;
  const role = isUserRole(metadataRole) ? metadataRole : null;
  return { role, isLoaded: true };
}
```

Always use this hook — never scatter `publicMetadata.role` casts in components.

---

## RequireRole layout route

`src/components/RequireRole.tsx` — uses `<Outlet />` as a layout guard:

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useProfile } from '@/hooks/useProfile';
import { getRoleHome } from '@/lib/roleRedirect';
import { ROUTES } from '@/lib/routes';
import type { UserRole } from '@/lib/roles';

interface RequireRoleProps {
  allowed: UserRole | UserRole[];
}

export default function RequireRole({ allowed }: RequireRoleProps) {
  const { role, isLoaded: roleLoaded } = useRole();
  const { profile, isLoaded: profileLoaded } = useProfile();
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  if (!roleLoaded || !profileLoaded) return <AuthLoading />;

  if (!role) return <Navigate to={`${ROUTES.onboarding}?step=role`} replace />;
  if (!profile.onboardingComplete) return <Navigate to={`${ROUTES.onboarding}?step=profile`} replace />;
  if (!allowedRoles.includes(role)) return <Navigate to={getRoleHome(role)} replace />;

  return <Outlet />;
}
```

Wire in `src/routes.tsx`:

```tsx
<Route element={<RequireRole allowed="Farmer" />}>
  <Route path="app/farmer" element={<FarmerDashboard />} />
</Route>

<Route element={<RequireRole allowed={['Farmer', 'Buyer']} />}>
  <Route path="app/orders" element={<Orders />} />
</Route>
```

---

## getRoleHome utility

`src/lib/roleRedirect.ts`:

```typescript
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
```

Use in `RequireRole`, `RoleRedirect` (`/app` index), and post-onboarding navigation.

---

## Express set-role endpoint

`server/routes/auth.ts`:

```typescript
authRouter.post('/set-role', requireClerkAuth, async (req, res) => {
  const parsed = setRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid role.' });
    return;
  }
  const { userId } = (req as AuthenticatedRequest).auth;
  const { role } = parsed.data;

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
  await upsertProfile({ clerk_user_id: userId, role });
  res.json({ ok: true, role });
});
```

`server/schemas/auth.ts` — Admin excluded from selectable roles:

```typescript
export const SELECTABLE_ROLES = ['Farmer', 'Buyer', 'Cooperative', 'Transport', 'Storage'] as const;
export const setRoleSchema = z.object({ role: z.enum(SELECTABLE_ROLES) });
```

---

## Express requireRole middleware

`server/middleware/clerkAuth.ts`:

```typescript
export function getUserRole(req: Request): string | undefined {
  const claims = (req as AuthenticatedRequest).auth?.sessionClaims ?? {};
  const publicMetadata =
    (claims.publicMetadata as { role?: string } | undefined) ??
    (claims.public_metadata as { role?: string } | undefined);
  return publicMetadata?.role;
}

export function requireRole(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = getUserRole(req);
    if (!role || !allowed.includes(role)) {
      res.status(403).json({ error: 'Insufficient role.' });
      return;
    }
    next();
  };
}
```

Usage:

```typescript
router.get('/admin/users', requireClerkAuth, requireRole('Admin'), listUsers);
router.post('/orders', requireClerkAuth, requireRole('Buyer'), createOrder);
```

Always chain `requireClerkAuth` before `requireRole`.

---

## Shared Zod schema

Client: `src/lib/schemas/role.ts`  
Server: `server/schemas/auth.ts`

Keep `SELECTABLE_ROLES` identical on both sides. Derive from `USER_ROLES` on the client when possible:

```typescript
export const SELECTABLE_ROLES = USER_ROLES.filter((r) => r !== 'Admin');
```
