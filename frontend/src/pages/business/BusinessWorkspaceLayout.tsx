import { Outlet } from 'react-router-dom';
import { FiGrid } from 'react-icons/fi';
import { useAuthContext } from '../../context/AuthContext';
import {
  WorkspaceChrome,
  WorkspaceNavItem,
} from '../../components/layout/WorkspaceChrome';

const navItems: WorkspaceNavItem[] = [
  { label: 'Projects', to: '/business/projects', icon: FiGrid, end: false },
];

export default function BusinessWorkspaceLayout() {
  const { session, logout } = useAuthContext();

  if (!session) return null;

  return (
    <WorkspaceChrome
      navItems={navItems}
      businessName={session.business.name}
      userName={`${session.user.firstName} ${session.user.lastName}`}
      userRole='Client'
      onLogout={logout}
      fullWidth
      dense
      navLayout='bar'
    >
      <Outlet />
    </WorkspaceChrome>
  );
}
