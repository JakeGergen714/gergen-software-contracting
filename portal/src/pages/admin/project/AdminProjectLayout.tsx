import {
  ProjectLayoutBase,
  ProjectNavItem,
} from '../../project/ProjectLayoutBase';

const navItems: ProjectNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'epics', label: 'Epics' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'change-requests', label: 'Changes' },
  { id: 'risks', label: 'Risks' },
  { id: 'dependencies', label: 'Deps' },
  { id: 'financials', label: 'Financials' },
];

export default function AdminProjectLayout() {
  return <ProjectLayoutBase mode='admin' navItems={navItems} />;
}
