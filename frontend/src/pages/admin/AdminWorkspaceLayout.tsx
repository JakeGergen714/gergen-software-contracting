import { Outlet } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import {
  WorkspaceChrome,
  WorkspaceNavItem,
} from '../../components/layout/WorkspaceChrome';

const navItems: WorkspaceNavItem[] = [
  { label: 'Overview', to: '/admin' },
  { label: 'Portfolio Metrics', to: '/admin/portfolio' },
  { label: 'Settings', to: '/admin/settings' },
];

export default function AdminWorkspaceLayout() {
  const { session, logout } = useAuthContext();

  if (!session) return null;

  return (
    <WorkspaceChrome
      navItems={navItems}
      businessName='Admin workspace'
      userName={`${session.user.firstName} ${session.user.lastName}`}
      userRole='Admin'
      onLogout={logout}
      fullWidth
      dense
    >
      <Outlet />
    </WorkspaceChrome>
  );
}
