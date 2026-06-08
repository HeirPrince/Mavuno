import { Navigate, Outlet } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useProfile } from '@/hooks/useProfile';
import { getRoleHome } from '@/lib/roleRedirect';
import { ROUTES } from '@/lib/routes';
import type { UserRole } from '@/lib/roles';

interface RequireRoleProps {
  allowed: UserRole | UserRole[];
}

function AuthLoading() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-on-surface-variant font-sans">Loading profile…</p>
      </div>
    </div>
  );
}

export default function RequireRole({ allowed }: RequireRoleProps) {
  const { role, isLoaded: roleLoaded } = useRole();
  const { profile, isLoaded: profileLoaded } = useProfile();
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  if (!roleLoaded || !profileLoaded) {
    return <AuthLoading />;
  }

  if (!role) {
    return <Navigate to={`${ROUTES.onboarding}?step=role`} replace />;
  }

  if (!profile.onboardingComplete) {
    return <Navigate to={`${ROUTES.onboarding}?step=profile`} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return <Outlet />;
}
