import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useAppContext } from '@/context/AppContext';
import { ROUTES } from '@/lib/routes';

function getHeaderTitle(pathname: string): string {
  if (pathname === ROUTES.admin.root) {
    return 'Operations Control Tower';
  }
  if (pathname.startsWith(ROUTES.admin.users)) return 'Operator Registry';
  if (pathname.startsWith(ROUTES.admin.fleet)) return 'Logistics Fleet Manager';
  if (pathname.startsWith(ROUTES.admin.requests)) return 'Active Consignment Leads';
  if (pathname.startsWith(ROUTES.admin.tracking)) return 'Live Dispatch Tracking';
  if (pathname.startsWith(ROUTES.admin.reports)) return 'Financial Ledger Audit';
  if (pathname.startsWith(ROUTES.admin.settings)) return 'Global System Parameters';
  return 'Operations Dashboard';
}

export default function AppLayout() {
  const { pathname } = useLocation();
  const { unverifiedCount } = useAppContext();
  const showSearchBar =
    pathname.startsWith(ROUTES.admin.users) || pathname.startsWith(ROUTES.admin.reports);
  const searchPlaceholder = pathname.startsWith(ROUTES.admin.users)
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
