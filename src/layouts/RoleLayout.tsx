import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import UserMenu from '@/components/UserMenu';

interface RoleLayoutProps {
  title: string;
  subtitle?: string;
}

export default function RoleLayout({ title, subtitle }: RoleLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="sticky top-0 z-40 bg-surface-low/90 backdrop-blur-md border-b border-[#ece7e4]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={ROUTES.landing} className="font-serif text-2xl font-bold text-primary">
            Mavuno
          </Link>
          <nav className="hidden md:flex items-center gap-6 font-sans text-sm font-semibold text-on-surface-variant">
            <Link to={ROUTES.marketplace} className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link to={ROUTES.orders} className="hover:text-primary transition-colors">
              Orders
            </Link>
          </nav>
          <UserMenu />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-primary">{title}</h1>
          {subtitle ? (
            <p className="text-on-surface-variant font-sans mt-2">{subtitle}</p>
          ) : null}
        </div>
        <Outlet />
      </main>
    </div>
  );
}
