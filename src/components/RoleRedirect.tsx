import { Navigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { getDashboardPath } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';

export default function RoleRedirect() {
  const { profile, isLoaded } = useUserRedirect();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile.onboardingComplete && profile.role !== 'Admin') {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Navigate to={getDashboardPath(profile.role)} replace />;
}

function useUserRedirect() {
  return useProfile();
}
