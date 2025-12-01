import { useMemo } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';

interface TouchpointItem {
  id: string;
  label: string;
  date: Date;
  summary: string;
  type: string;
}

export default function BusinessProjectOps() {
  const { project } = useProjectWorkspace();

  const opsNotes = project.statusNote ?? 'No open risks right now.';

  const touchpoints: TouchpointItem[] = useMemo(() => {
    return project.meetings
      .map((meeting) => ({
        id: meeting.id,
        label: meeting.type,
        date: new Date(meeting.scheduledAt),
        summary: meeting.summary,
        type: meeting.type,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  }, [project.meetings]);

  const proactiveActions = useMemo(() => {
    const awaitingApproval = project.epics.filter(
      (epic) => epic.status === 'AWAITING_APPROVAL'
    );
    const dependencyStories = project.stories.filter(
      (story) => !story.sprintId
    );
    return {
      awaitingApproval,
      dependencyStories,
    };
  }, [project.epics, project.stories]);

  return (
    <div className='space-y-6'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] grid gap-6 md:grid-cols-2'>
        <div>
          <p className='text-xs uppercase tracking-wide font-semibold text-slate-500'>
            Operations pulse
          </p>
          <h2 className='text-2xl font-semibold text-slate-900 mt-1'>
            What we are watching
          </h2>
          <p className='text-sm text-slate-600 mt-2'>{opsNotes}</p>
          <div className='mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600'>
            <p className='font-semibold text-slate-900'>Availability</p>
            <p>
              Delivery hours are booked for the next sprint. Ping us if you need
              an urgent change.
            </p>
          </div>
        </div>
        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
          <p className='text-xs uppercase tracking-wide font-semibold text-slate-500'>
            Contact
          </p>
          <ul className='mt-3 space-y-3 text-sm text-slate-600'>
            <li>
              <span className='font-semibold text-slate-900'>Slack:</span>{' '}
              #client-{project.name.toLowerCase().replace(/\s+/g, '-')}
            </li>
            <li>
              <span className='font-semibold text-slate-900'>
                Priority email:
              </span>{' '}
              support@gergensoftware.com
            </li>
            <li>
              <span className='font-semibold text-slate-900'>On-call:</span> +1
              (402) 555-0192
            </li>
          </ul>
        </div>
      </section>

      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)] grid gap-6 md:grid-cols-2'>
        <div>
          <h3 className='text-xl font-semibold text-slate-900'>
            Recent touchpoints
          </h3>
          <div className='mt-4 space-y-3 max-h-[360px] overflow-y-auto pr-2'>
            {touchpoints.length > 0 ? (
              touchpoints.map((touch) => (
                <article
                  key={touch.id}
                  className='rounded-2xl border border-slate-100 bg-slate-50 p-3'
                >
                  <div className='flex items-center justify-between text-xs font-semibold text-slate-500'>
                    <span>{touch.type}</span>
                    <span>{touch.date.toLocaleDateString()}</span>
                  </div>
                  <p className='text-sm font-semibold text-slate-900 mt-1'>
                    {touch.summary}
                  </p>
                </article>
              ))
            ) : (
              <p className='text-sm text-slate-500'>No calls logged yet.</p>
            )}
          </div>
        </div>
        <div>
          <h3 className='text-xl font-semibold text-slate-900'>Action items</h3>
          <div className='mt-4 space-y-3'>
            <div className='rounded-2xl border border-amber-100 bg-amber-50 p-4'>
              <p className='text-sm font-semibold text-amber-900'>
                Approvals needed
              </p>
              {proactiveActions.awaitingApproval.length > 0 ? (
                <ul className='mt-2 list-disc list-inside text-sm text-amber-800'>
                  {proactiveActions.awaitingApproval.map((epic) => (
                    <li key={epic.id}>{epic.name}</li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-amber-800 mt-2'>
                  All epics are green-lit.
                </p>
              )}
            </div>
            <div className='rounded-2xl border border-rose-100 bg-rose-50 p-4'>
              <p className='text-sm font-semibold text-rose-900'>
                Dependencies
              </p>
              {proactiveActions.dependencyStories.length > 0 ? (
                <ul className='mt-2 list-disc list-inside text-sm text-rose-800'>
                  {proactiveActions.dependencyStories.map((story) => (
                    <li key={story.id}>{story.title}</li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm text-rose-800 mt-2'>
                  No blocked stories reported.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
