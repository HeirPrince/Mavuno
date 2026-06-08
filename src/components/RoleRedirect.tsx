import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useProfile } from '@/hooks/useProfile';
import { getRoleHome } from '@/lib/roleRedirect';
import { ROUTES } from '@/lib/routes';

export default function RoleRedirect() {
  const { role, isLoaded: roleLoaded } = useRole();
  const { profile, isLoaded: profileLoaded } = useProfile();

  if (!roleLoaded || !profileLoaded) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) {
    return <Navigate to={`${ROUTES.onboarding}?step=role`} replace />;
  }

  if (!profile.onboardingComplete) {
    return <Navigate to={`${ROUTES.onboarding}?step=profile`} replace />;
  }

  return <Navigate to={getRoleHome(role)} replace />;
}
