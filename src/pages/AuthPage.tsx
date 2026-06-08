import { SignIn, SignUp, useAuth } from '@clerk/react';
import { Link, Navigate } from 'react-router-dom';

export function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link to="/" className="font-serif text-3xl font-bold text-primary tracking-tight">
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
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </div>
  );
}

export function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <Link to="/" className="font-serif text-3xl font-bold text-primary tracking-tight">
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
        fallbackRedirectUrl="/"
        forceRedirectUrl="/"
      />
    </div>
  );
}
