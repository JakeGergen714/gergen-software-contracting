import { NavLink, Outlet } from 'react-router-dom';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';

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
  const workspace = useProjectWorkspace();
  const { project } = workspace;
  const activeSprint = project.sprints.find((s) => s.status === 'ACTIVE');
  const upcomingSprint = project.sprints.find((s) => s.status === 'PLANNED');

  return (
    <div className='space-y-6'>
      <section className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>
              Sprint control center
            </p>
            <h2 className='font-display text-2xl text-slate-900'>
              {activeSprint
                ? `Running ${activeSprint.name}`
                : 'No sprint active'}
            </h2>
            <p className='text-sm text-slate-500'>
              {activeSprint
                ? `Ends ${new Date(
                    activeSprint.endAt
                  ).toLocaleDateString()}. Keep blockers clear and burndown smooth.`
                : upcomingSprint
                ? `Next up: ${upcomingSprint.name}. Finish grooming and capacity checks before kickoff.`
                : 'Line up the next commitment and keep the backlog in fighting shape.'}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600'>
            <p className='font-semibold text-slate-900'>At-a-glance</p>
            <p>
              {project.stories.filter((s) => s.stage === 'IN_PROGRESS').length}{' '}
              in progress
            </p>
            <p>
              {project.stories.filter((s) => s.stage === 'IN_REVIEW').length}{' '}
              awaiting review
            </p>
            <p>
              {project.stories.filter((s) => s.stage === 'BACKLOG').length}{' '}
              awaiting grooming
            </p>
          </div>
        </div>
      </section>

      <div className='rounded-2xl border border-border-subtle/60 bg-surface px-4 py-3 shadow-card'>
        <nav
          className='flex flex-wrap gap-3 text-sm font-semibold'
          aria-label='Sprint navigation'
        >
          {sprintSections.map((section) => (
            <NavLink
              key={section.id}
              to={section.id}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 transition ${
                  isActive
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
              end={false}
            >
              <span>{section.label}</span>
              <span className='block text-[11px] font-normal text-slate-400'>
                {section.helper}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet context={workspace} />
    </div>
  );
}
