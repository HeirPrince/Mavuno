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
} from 'lucide-react';

const ROUTES: Record<string, string> = {
  dashboard: '/',
  users: '/users',
  fleet: '/fleet',
  requests: '/requests',
  reports: '/reports',
  settings: '/settings',
};

interface SidebarProps {
  unverifiedUserCount?: number;
}

export default function Sidebar({ unverifiedUserCount }: SidebarProps) {
  const navigate = useNavigate();

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
  ];

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
          AgriTrans
        </h1>
        <p className="text-xs text-on-surface-variant font-sans font-medium tracking-wide mt-1 opacity-80">
          Premium Fleet Management
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const to = ROUTES[item.id];
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
        <button
          type="button"
          onClick={() => navigate('/requests')}
          className="w-full bg-primary text-white py-3 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 mb-4 hover:bg-primary-container hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>

        <NavLink to="/settings" className={navClass}>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </div>
        </NavLink>

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
