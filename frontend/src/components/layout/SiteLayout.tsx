import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { PageShell } from '../ui/PageShell';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-text-primary font-semibold'
    : 'text-text-muted hover:text-text-primary transition-colors';

export function SiteLayout() {
  const { session, logout } = useAuthContext();

  return (
    <div className='min-h-screen flex flex-col bg-surface-alt text-text-primary'>
      <header className='sticky top-0 z-30 border-b border-border-subtle/70 bg-surface/90 backdrop-blur-xl'>
        <div className='grid-shell h-16 flex items-center justify-between gap-4'>
          <Link to='/' className='font-display text-xl font-semibold'>
            Gergen Software
          </Link>
          <nav className='flex items-center gap-4 text-sm'>
            <NavLink to='/' className={linkClass}>
              Home
            </NavLink>
            <NavLink to='/faq' className={linkClass}>
              FAQ
            </NavLink>
            {session ? (
              <div className='flex items-center gap-3'>
                <NavLink to='/business' className={linkClass}>
                  Business
                </NavLink>
                <NavLink to='/admin' className={linkClass}>
                  Admin
                </NavLink>
                <button
                  type='button'
                  onClick={logout}
                  className='btn-secondary text-xs px-4 py-2'
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <NavLink to='/login' className={linkClass}>
                  Login
                </NavLink>
                <Link to='/start' className='btn-primary text-xs px-5 py-2'>
                  Start now
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className='flex-1'>
        <PageShell className='py-10 sm:py-12'>
          <Outlet />
        </PageShell>
      </main>
      <footer className='border-t border-border-subtle bg-surface py-6'>
        <div className='grid-shell flex flex-col gap-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between'>
          <span>© {new Date().getFullYear()} Gergen Software Contracting</span>
          <div className='flex flex-wrap gap-4 text-xs uppercase tracking-wide'>
            <Link to='/faq' className='hover:text-text-primary'>
              FAQ
            </Link>
            <a
              href='mailto:contact@gergensoftware.com'
              className='hover:text-text-primary'
            >
              Contact
            </a>
            <a
              href='https://github.com/jakegergen714'
              target='_blank'
              rel='noreferrer'
              className='hover:text-text-primary'
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
