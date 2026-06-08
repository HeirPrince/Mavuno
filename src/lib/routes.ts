export const ROUTES = {
  landing: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  onboarding: '/onboarding',
  app: '/app',
  farmer: {
    root: '/app/farmer',
    listings: '/app/farmer/listings',
  },
  buyer: {
    root: '/app/buyer',
  },
  marketplace: '/app/marketplace',
  orders: '/app/orders',
  cooperative: '/app/cooperative',
  storage: '/app/storage',
  admin: {
    root: '/app/admin',
    users: '/app/admin/users',
    fleet: '/app/admin/fleet',
    requests: '/app/admin/requests',
    tracking: '/app/admin/tracking',
    reports: '/app/admin/reports',
    settings: '/app/admin/settings',
  },
} as const;
