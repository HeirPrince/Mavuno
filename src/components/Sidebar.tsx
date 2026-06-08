import UserMenu from '@/components/UserMenu';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Truck,
  TrendingUp,
  Settings,
  HelpCircle,
  Plus,
  Inbox,
  Radio,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useProfile } from '@/hooks/useProfile';

const ROUTE_MAP: Record<string, string> = {
  dashboard: ROUTES.admin.root,
  users: ROUTES.admin.users,
  fleet: ROUTES.admin.fleet,
  requests: ROUTES.admin.requests,
  reports: ROUTES.admin.reports,
  settings: ROUTES.admin.settings,
  tracking: ROUTES.admin.tracking,
};

interface SidebarProps {
  unverifiedUserCount?: number;
}

export default function Sidebar({ unverifiedUserCount }: SidebarProps) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const isTransportOnly = profile.role === 'Transport';

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'users',
      name: 'User Management',
      icon: Users,
      badge: unverifiedUserCount,
    },
    { id: 'fleet', name: 'Fleet', icon: Truck },
    { id: 'requests', name: 'Requests', icon: Inbox },
    { id: 'reports', name: 'Reports', icon: TrendingUp },
    ...(isTransportOnly
      ? [{ id: 'tracking', name: 'Live Tracking', icon: Radio }]
      : []),
  ].filter((item) => {
    if (!isTransportOnly) return true;
    return item.id === 'fleet' || item.id === 'tracking';
  });

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group font-sans text-sm font-semibold tracking-wide ${
      isActive
        ? 'text-primary bg-primary/10 border-r-4 border-primary font-bold'
        : 'text-on-surface-variant hover:bg-secondary/5 hover:text-secondary'
    }`;

  return (
    <aside className="w-64 bg-surface-low border-r border-[#ece7e4] h-screen fixed left-0 top-0 flex flex-col pt-12 pb-6 px-4 z-50">
      <div className="mb-10 px-4">
        <h1 className="font-serif text-2xl font-bold text-primary tracking-tight leading-none">
          Mavuno
        </h1>
        <p className="text-xs text-on-surface-variant font-sans font-medium tracking-wide mt-1 opacity-80">
          AgriTrans Operations
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const to = ROUTE_MAP[item.id];
          return (
            <NavLink key={item.id} to={to} end={item.id === 'dashboard'} className={navClass}>
              <div className="flex items-center gap-3">
                <IconComponent className="w-5 h-5 transition-transform group-hover:scale-105 duration-300" />
                <span>{item.name}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-[#ece7e4]/50 space-y-1">
        {!isTransportOnly ? (
          <button
            type="button"
            onClick={() => navigate(ROUTES.admin.requests)}
            className="w-full bg-primary text-white py-3 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 mb-4 hover:bg-primary-container hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
        ) : null}

        {!isTransportOnly ? (
        <NavLink to={ROUTES.admin.settings} className={navClass}>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </NavLink>
        ) : null}

        <button
          type="button"
          onClick={() =>
            alert(
              'Connecting you with our support team in Kigali. Live chat response is currently under 3 minutes.',
            )
          }
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-secondary/5 hover:text-secondary transition-all duration-300 font-sans text-sm font-semibold tracking-wide"
        >
          <HelpCircle className="w-5 h-5" />
          <span>Support</span>
        </button>

        <UserMenu />
      </div>
    </aside>
  );
}
