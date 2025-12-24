import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceOutletContext } from '../../project/ProjectLayoutBase';
import { Stack } from '../../../components/ui/container';
import { Card } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { cn } from '../../../utils/cn';

const sprintSections = [
  { id: 'backlog', label: 'Product backlog', helper: 'Grooming + readiness' },
  {
    id: 'planning',
    label: 'Sprint planning',
    helper: 'Capacity & commitments',
  },
  {
    id: 'active',
    label: 'Sprint execution',
    helper: 'Move work & close sprints',
  },
];

export default function AdminProjectSprintLayout() {
  const { project } = useOutletContext<ProjectWorkspaceOutletContext>();
  const activeSprint = project.sprints.find((s) => s.status === 'ACTIVE');
  const upcomingSprint = project.sprints.find((s) => s.status === 'PLANNED');

  return (
    <Stack gap={6}>
      <Card className='p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <Text variant='eyebrow' className='text-text-muted'>
              Sprint control center
            </Text>
            <Heading level='h2' className='text-2xl text-text-primary'>
              {activeSprint
                ? `Running ${activeSprint.name}`
                : 'No sprint active'}
            </Heading>
            <Text variant='body' className='text-text-muted'>
              {activeSprint
                ? `Ends ${new Date(
                    activeSprint.endAt
                  ).toLocaleDateString()}. Keep blockers clear and burndown smooth.`
                : upcomingSprint
                ? `Next up: ${upcomingSprint.name}. Finish grooming and capacity checks before kickoff.`
                : 'Line up the next commitment and keep the backlog in fighting shape.'}
            </Text>
          </div>
          <div className='rounded-2xl border border-border-subtle bg-surface-alt px-4 py-3 text-sm text-text-muted'>
            <Text weight='semibold' className='text-text-primary'>
              At-a-glance
            </Text>
            <Text variant='body'>
              {project.stories.filter((s) => s.stage === 'IN_PROGRESS').length}{' '}
              in progress ·{' '}
              {project.stories.filter((s) => s.stage === 'IN_REVIEW').length} in
              review
            </Text>
          </div>
        </div>
      </Card>

      <div className='grid gap-6 lg:grid-cols-[280px,1fr]'>
        <nav className='flex flex-col gap-2'>
          {sprintSections.map((section) => (
            <NavLink
              key={section.id}
              to={section.id}
              className={({ isActive }) =>
                cn(
                  'group flex flex-col rounded-2xl border p-4 transition-all',
                  isActive
                    ? 'border-brand-subtle bg-brand-soft shadow-sm'
                    : 'border-transparent hover:bg-surface hover:shadow-sm'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Text
                    weight='semibold'
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-brand-strong' : 'text-text-primary'
                    )}
                  >
                    {section.label}
                  </Text>
                  <Text
                    variant='caption'
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-brand-strong' : 'text-text-muted'
                    )}
                  >
                    {section.helper}
                  </Text>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className='min-w-0'>
          <Outlet context={{ project }} />
        </div>
      </div>
    </Stack>
  );
}
