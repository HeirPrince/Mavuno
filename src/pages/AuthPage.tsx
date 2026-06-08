import { useState } from 'react';
import { SignIn, SignUp, useAuth } from '@clerk/react';
import { Link, Navigate } from 'react-router-dom';
import { USER_ROLES, ROLE_LABELS, type UserRole } from '@/lib/roles';
import { setPendingRole } from '@/hooks/useProfile';
import { useProfile } from '@/hooks/useProfile';
import { getDashboardPath } from '@/lib/roles';
import { ROUTES } from '@/lib/routes';

const SIGNUP_ROLES = USER_ROLES.filter((r) => r !== 'Admin');

function PostAuthRedirect() {
  const { profile } = useProfile();

  if (!profile.onboardingComplete && profile.role !== 'Admin') {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  return <Navigate to={getDashboardPath(profile.role)} replace />;
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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [confirmedRole, setConfirmedRole] = useState(false);

  if (isLoaded && isSignedIn) {
    return <PostAuthRedirect />;
  }

  const handleRoleConfirm = () => {
    if (!selectedRole) return;
    setPendingRole(selectedRole);
    setConfirmedRole(true);
  };

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

      {!confirmedRole ? (
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#ece7e4] p-8 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary text-center">
            Choose your role
          </h2>
          <p className="font-sans text-sm text-on-surface-variant text-center mt-2">
            Select how you will use Mavuno on the platform.
          </p>
          <div className="grid grid-cols-1 gap-2 mt-6">
            {SIGNUP_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left px-4 py-3 rounded-xl border font-sans text-sm font-semibold transition-all cursor-pointer ${
                  selectedRole === role
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-[#ece7e4] hover:border-primary/30'
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!selectedRole}
            onClick={handleRoleConfirm}
            className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-sans font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            Continue to sign up
          </button>
          <p className="font-sans text-xs text-on-surface-variant text-center mt-4">
            Already have an account?{' '}
            <Link to={ROUTES.signIn} className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/onboarding"
          forceRedirectUrl="/onboarding"
        />
      )}
    </div>
  );
}
