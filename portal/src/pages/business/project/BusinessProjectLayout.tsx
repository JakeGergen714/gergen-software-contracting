import {
  ProjectLayoutBase,
  ProjectNavItem,
} from '../../project/ProjectLayoutBase';

const navItems: ProjectNavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'ops', label: 'Ops' },
];

export default function BusinessProjectLayout() {
  return <ProjectLayoutBase mode='client' navItems={navItems} />;
}
