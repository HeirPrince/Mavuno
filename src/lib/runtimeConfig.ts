declare global {
  interface Window {
    __MAVUNO_RUNTIME_CONFIG__?: {
      VITE_CLERK_PUBLISHABLE_KEY?: string;
    };
  }
}

export function getClerkPublishableKey(): string | undefined {
  const key =
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
    import.meta.env.VITE_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (typeof window !== 'undefined'
      ? window.__MAVUNO_RUNTIME_CONFIG__?.VITE_CLERK_PUBLISHABLE_KEY
      : undefined);
  const trimmed = key?.trim();
  return trimmed || undefined;
}
