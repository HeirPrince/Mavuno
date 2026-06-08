import { ClerkProvider } from '@clerk/react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClerkPublishableKey } from '@/lib/runtimeConfig';
import { ROUTES } from '@/lib/routes';

const publishableKey = getClerkPublishableKey();

export default function ClerkRoot({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  if (!publishableKey) {
    console.warn(
      'Missing VITE_CLERK_PUBLISHABLE_KEY. Add it to .env or .env.local (see .env.example).',
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey ?? ''}
      afterSignOutUrl={ROUTES.signIn}
      signInFallbackRedirectUrl={ROUTES.app}
      signUpFallbackRedirectUrl={ROUTES.onboarding}
      signInForceRedirectUrl={ROUTES.app}
      signUpForceRedirectUrl={ROUTES.onboarding}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}
