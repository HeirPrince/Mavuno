import { useClerk, useUser } from '@clerk/react';
import { ChevronUp, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function getDisplayName(fullName: string | null | undefined, email: string | undefined) {
  if (fullName?.trim()) return fullName.trim();
  if (email) return email.split('@')[0];
  return 'User';
}

function getInitials(fullName: string | null | undefined, email: string | undefined) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName = getDisplayName(user?.fullName, email);
  const initials = getInitials(user?.fullName, email);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  if (!isLoaded) {
    return (
      <div className="mt-4 flex items-center gap-3 px-2 py-2 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-surface-high" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded bg-surface-high" />
          <div className="h-2 w-32 rounded bg-surface-high/70" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div ref={menuRef} className="relative mt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-secondary/5 transition-colors cursor-pointer group"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt=""
            className="w-9 h-9 rounded-full object-cover border-2 border-primary/15 shrink-0"
          />
        ) : (
          <span className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center border-2 border-primary/15 shrink-0">
            {initials}
          </span>
        )}
        <span className="flex-1 min-w-0 text-left">
          <span className="block text-sm font-sans font-semibold text-primary truncate">
            {displayName}
          </span>
          {email ? (
            <span className="block text-[11px] text-on-surface-variant truncate opacity-80">
              {email}
            </span>
          ) : null}
        </span>
        <ChevronUp
          className={`w-4 h-4 text-on-surface-variant/60 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-0' : 'rotate-180'
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 mb-2 py-1 rounded-xl bg-white border border-[#ece7e4] shadow-lg shadow-primary/5 z-50"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut({ redirectUrl: '/sign-in' });
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-sans font-semibold text-on-surface-variant hover:bg-secondary/5 hover:text-secondary transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
