import { ClerkProvider } from '@clerk/react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

function resolvePublishableKey(): string | undefined {
  const key =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

const publishableKey = resolvePublishableKey();

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
      afterSignOutUrl="/sign-in"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      signInForceRedirectUrl="/"
      signUpForceRedirectUrl="/"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
}
