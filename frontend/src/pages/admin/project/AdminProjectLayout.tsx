import {
  ProjectLayoutBase,
  ProjectNavItem,
} from '../../project/ProjectLayoutBase';

const navItems: ProjectNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'board', label: 'Board' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'change-requests', label: 'Changes' },
  { id: 'risks', label: 'Risks' },
  { id: 'dependencies', label: 'Deps' },
  { id: 'financials', label: 'Financials' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'epics', label: 'Epics' },
  { id: 'ops', label: 'Ops' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'sprint', label: 'Sprint' },
];

export default function AdminProjectLayout() {
  return <ProjectLayoutBase mode='admin' navItems={navItems} />;
}
