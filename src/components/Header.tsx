import {
  Bell,
  Search,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackClick?: () => void;
  showSearchBar?: boolean;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  hasNotifications?: boolean;
  onNotificationClick?: () => void;
  onDispatchActionClick?: () => void;
  dispatchButtonText?: string;
  subTitleBadge?: string;
  activeOverviewTab?: string;
  setOverviewTab?: (tab: string) => void;
}

export default function Header({
  title,
  subtitle,
  onBackClick,
  showSearchBar = true,
  onSearchChange,
  searchPlaceholder = "Search...",
  hasNotifications = true,
  onNotificationClick,
  onDispatchActionClick,
  dispatchButtonText = "Dispatch Now",
  subTitleBadge,
  activeOverviewTab,
  setOverviewTab
}: HeaderProps) {
  return (
    <header className="sticky top-0 bg-surface/80 backdrop-blur-md border-b border-[#ece7e4] flex justify-between items-center w-full px-16 py-4 z-40">
      {/* Title block / Back button */}
      <div className="flex items-center gap-4">
        {onBackClick && (
          <button 
            onClick={onBackClick}
            className="p-2 hover:bg-surface-container rounded-full text-primary hover:text-secondary transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-primary tracking-tight">{title}</h2>
            {subTitleBadge && (
              <span className="inline-flex items-center gap-1 px-3 py-0.5 text-xs font-bold text-secondary bg-secondary/10 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{subTitleBadge}</span>
              </span>
            )}
          </div>
          {activeOverviewTab && setOverviewTab && (
            <nav className="flex gap-6 mt-1.5">
              <button 
                onClick={() => setOverviewTab('overview')}
                className={`text-sm font-sans font-bold pb-0.5 border-b-2 transition-all ${
                  activeOverviewTab === 'overview' 
                    ? 'text-primary border-primary' 
                    : 'text-on-surface-variant/70 border-transparent hover:text-secondary'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setOverviewTab('requests')}
                className={`text-sm font-sans font-bold pb-0.5 border-b-2 transition-all ${
                  activeOverviewTab === 'requests' 
                    ? 'text-primary border-primary' 
                    : 'text-on-surface-variant/70 border-transparent hover:text-secondary'
                }`}
              >
                Requests
              </button>
              <button 
                onClick={() => setOverviewTab('tracking')}
                className={`text-sm font-sans font-bold pb-0.5 border-b-2 transition-all ${
                  activeOverviewTab === 'tracking' 
                    ? 'text-primary border-primary' 
                    : 'text-on-surface-variant/70 border-transparent hover:text-secondary'
                }`}
              >
                Tracking
              </button>
            </nav>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        {showSearchBar && onSearchChange && (
          <div className="relative hidden lg:block group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-surface-low border border-transparent hover:border-[#ece7e4] rounded-full py-2 pl-11 pr-4 w-64 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white text-on-surface transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
        )}

        {/* Notifications alarm */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onNotificationClick || (() => alert("Alert Log: Active transits are progressing under standard speed and temperature conditions."))}
            className="p-2 rounded-full hover:bg-surface-low text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary rounded-full ring-2 ring-surface"></span>
            )}
          </button>

          {/* Dispatch actions call-to-action */}
          {onDispatchActionClick && (
            <button
              onClick={onDispatchActionClick}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-sans text-xs font-bold tracking-wide hover:bg-primary-container hover:shadow-lg hover:shadow-primary/10 transition-all active:scale-95 cursor-pointer"
            >
              {dispatchButtonText}
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
