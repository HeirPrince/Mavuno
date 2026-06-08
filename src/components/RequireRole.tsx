import { Navigate, Outlet } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { getDashboardPath, type UserRole } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';

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
  const { profile, isLoaded } = useProfile();
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  if (!isLoaded) {
    return <AuthLoading />;
  }

  if (!profile.onboardingComplete && profile.role !== 'Admin') {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to={getDashboardPath(profile.role)} replace />;
  }

  return <Outlet />;
}
