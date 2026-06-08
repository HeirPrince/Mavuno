import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAppContext } from '@/context/AppContext';

function getHeaderTitle(pathname: string): string {
  if (pathname === '/' || pathname.startsWith('/dashboard')) {
    return 'Operations Control Tower';
  }
  if (pathname.startsWith('/users')) return 'Operator Registry';
  if (pathname.startsWith('/fleet')) return 'Logistics Fleet Manager';
  if (pathname.startsWith('/requests')) return 'Active Consignment Leads';
  if (pathname.startsWith('/tracking')) return 'Live Dispatch Tracking';
  if (pathname.startsWith('/reports')) return 'Financial Ledger Audit';
  if (pathname.startsWith('/settings')) return 'Global System Parameters';
  return 'Operations Dashboard';
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const { unverifiedCount } = useAppContext();
  const showSearchBar =
    pathname.startsWith('/users') || pathname.startsWith('/reports');
  const searchPlaceholder = pathname.startsWith('/users')
    ? 'Search operators...'
    : 'Search transactions...';

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar unverifiedUserCount={unverifiedCount} />
      <div className="flex-1 pl-64 flex flex-col min-w-0">
        <Header
          title={getHeaderTitle(pathname)}
          subtitle="System uptime is stable. Inter-district routing corridors clear."
          showSearchBar={showSearchBar}
          searchPlaceholder={searchPlaceholder}
          hasNotifications={unverifiedCount > 0}
        />
        <main className="flex-1 px-16 py-10 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
