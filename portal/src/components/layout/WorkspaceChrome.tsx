import { ReactNode, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { FiCommand, FiLogOut } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import clsx from 'clsx';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';

export interface WorkspaceNavItem {
  label: string;
  to: string;
  icon?: IconType;
  end?: boolean;
}

interface WorkspaceChromeProps {
  navItems: WorkspaceNavItem[];
  children: ReactNode;
  businessName?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => void;
  fullWidth?: boolean;
  dense?: boolean;
  navLayout?: 'rail' | 'bar';
}

export function WorkspaceChrome({
  navItems,
  children,
  businessName,
  userName,
  userRole,
  onLogout,
  fullWidth = false,
  dense = false,
  navLayout = 'rail',
}: WorkspaceChromeProps) {
  const initials = useMemo(() => {
    if (!userName) return 'GS';
    return userName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }, [userName]);

  const shellClass = fullWidth
    ? 'w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10'
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  const headerPadding = dense ? 'py-2' : 'py-4';
  const bodyPadding = dense ? 'py-4' : 'py-8';
  const contentGap = dense ? 'space-y-4' : 'space-y-8';
  const showRailNav = navLayout === 'rail' && navItems.length > 0;
  const showBarNav = navLayout === 'bar' && navItems.length > 0;

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      <header className='sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md'>
        <div
          className={`${shellClass} flex flex-wrap items-center gap-4 ${headerPadding}`}
        >
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center shadow-sm'>
              {initials}
            </div>
            <div className='leading-tight'>
              <p className='text-xs font-bold uppercase tracking-wider text-slate-500'>
                Gergen Software
              </p>
              <p className='text-base font-semibold text-slate-900'>
                {businessName || 'Workspace'}
              </p>
            </div>
          </div>
          <div className='hidden md:block flex-1 max-w-md ml-8'>
            <GlobalSearch />
          </div>
          <div className='flex items-center gap-3 ml-auto'>
            <NotificationBell />
            <div className='hidden sm:flex flex-col text-right leading-tight'>
              <span className='text-sm font-semibold text-slate-900'>
                {userName || 'Workspace member'}
              </span>
              {userRole && (
                <span className='text-xs text-slate-500'>{userRole}</span>
              )}
            </div>
            <div className='h-9 w-9 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold flex items-center justify-center border border-slate-200'>
              {initials}
            </div>
            {onLogout && (
              <button
                type='button'
                onClick={onLogout}
                className='hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors'
              >
                <FiLogOut className='text-slate-400' />
                Sign out
              </button>
            )}
          </div>
        </div>
        {showRailNav && (
          <div className='border-t border-slate-200 bg-white md:hidden'>
            <div
              className={`${shellClass} flex items-center gap-2 overflow-x-auto py-2 text-sm`}
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-full border px-3 py-1.5 font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
        {showBarNav && (
          <div className='border-t border-slate-200 bg-white'>
            <div
              className={`${shellClass} flex items-center gap-2 overflow-x-auto py-2 text-sm`}
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'rounded-full border px-4 py-1.5 font-semibold whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className={`${shellClass} ${bodyPadding}`}>
        <div
          className={clsx(
            showRailNav ? 'lg:grid lg:grid-cols-[72px,1fr] lg:gap-8' : '',
            contentGap
          )}
        >
          {showRailNav && (
            <nav
              aria-label='Workspace navigation'
              className='hidden lg:flex flex-col items-center gap-3 bg-white border border-slate-200 rounded-2xl px-2 py-4 sticky top-24 h-fit shadow-sm'
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx(
                        'flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-all duration-200',
                        isActive
                          ? 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      )
                    }
                    title={item.label}
                  >
                    {Icon ? (
                      <Icon aria-hidden />
                    ) : (
                      <span className='text-xs font-semibold'>
                        {item.label[0]}
                      </span>
                    )}
                  </NavLink>
                );
              })}
              <div className='w-8 border-t border-slate-100 my-1'></div>
              <button
                type='button'
                className='flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors'
                aria-label='Open command palette'
              >
                <FiCommand size={18} />
              </button>
            </nav>
          )}
          <main className='flex-1 min-w-0 space-y-6'>{children}</main>
        </div>
      </div>
    </div>
  );
}
