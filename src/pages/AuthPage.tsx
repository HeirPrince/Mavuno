import { SignIn, SignUp, useAuth } from '@clerk/react';
import { Link, Navigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { getRoleHome } from '@/lib/roleRedirect';
import { ROUTES } from '@/lib/routes';

function PostAuthRedirect() {
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

export function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <PostAuthRedirect />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link to={ROUTES.landing} className="font-serif text-3xl font-bold text-primary tracking-tight">
          Mavuno
        </Link>
        <p className="mt-2 text-sm text-on-surface-variant font-sans">
          Connect. Harvest. Thrive.
        </p>
      </div>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/app"
        forceRedirectUrl="/app"
      />
    </div>
  );
}

export function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <PostAuthRedirect />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link to={ROUTES.landing} className="font-serif text-3xl font-bold text-primary tracking-tight">
          Mavuno
        </Link>
        <p className="mt-2 text-sm text-on-surface-variant font-sans">
          Connect. Harvest. Thrive.
        </p>
      </div>
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl={`${ROUTES.onboarding}?step=role`}
        forceRedirectUrl={`${ROUTES.onboarding}?step=role`}
      />
      <p className="font-sans text-xs text-on-surface-variant text-center mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.signIn} className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
