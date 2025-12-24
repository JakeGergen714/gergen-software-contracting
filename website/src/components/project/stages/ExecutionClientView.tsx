import { useMemo } from 'react';
import { ProjectDetail } from '../../../types/domain';
import { useDomainModal } from '../../domain/DomainModalProvider';

export function ExecutionClientView({ project }: { project: ProjectDetail }) {
  const { openEpic, openSprint } = useDomainModal();
  const epicProgress = useMemo(() => {
    return project.epics.map((epic) => {
      const stories = project.stories.filter(
        (story) => story.epicId === epic.id
      );
      const done = stories.filter((story) => story.stage === 'DONE').length;
      return {
        epic,
        total: stories.length,
        done,
        inFlight: stories.filter((story) => story.stage === 'IN_PROGRESS')
          .length,
      };
    });
  }, [project.epics, project.stories]);

  const activeSprint = project.sprints.find((s) => s.status === 'ACTIVE');

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <h2 className='text-2xl font-semibold text-slate-900'>
          Execution in progress
        </h2>
        <p className='text-slate-600 mt-2'>
          We are actively building and shipping features. Track sprint progress
          and which epics have shipped.
        </p>
        {activeSprint ? (
          <button
            type='button'
            onClick={() => openSprint(activeSprint.id)}
            className='mt-4 w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-800'
          >
            <p className='text-xs uppercase tracking-wide text-emerald-600'>
              Current sprint
            </p>
            <p className='text-lg font-semibold text-emerald-900'>
              {activeSprint.name}
            </p>
            <p>{activeSprint.goal}</p>
            <p className='text-xs text-emerald-600 mt-1'>
              {new Date(activeSprint.startAt).toLocaleDateString()} –
              {new Date(activeSprint.endAt).toLocaleDateString()}
            </p>
          </button>
        ) : (
          <p className='text-sm text-slate-500 mt-4'>
            No active sprint at the moment.
          </p>
        )}
      </section>

      <section className='rounded-3xl border border-white/70 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)] space-y-4'>
        <h3 className='text-xl font-semibold text-slate-900'>Epic progress</h3>
        {epicProgress.length > 0 ? (
          epicProgress.map(({ epic, total, done, inFlight }) => (
            <button
              type='button'
              key={epic.id}
              onClick={() => openEpic(epic.id)}
              className='rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left space-y-2'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span
                    className='w-2 h-2 rounded-full'
                    style={{ backgroundColor: epic.color }}
                  />
                  <p className='font-semibold text-slate-900'>{epic.name}</p>
                </div>
                <span className='text-xs uppercase text-slate-500'>
                  {done}/{total || 1} stories done
                </span>
              </div>
              <div className='h-2 rounded-full bg-white border border-slate-100 overflow-hidden'>
                <div
                  className='h-full bg-slate-900'
                  style={{
                    width: `${total ? Math.round((done / total) * 100) : 0}%`,
                  }}
                />
              </div>
              <div className='text-xs text-slate-500 flex justify-between'>
                <span>In build: {inFlight}</span>
                <span>Complete: {done}</span>
              </div>
            </button>
          ))
        ) : (
          <p className='text-sm text-slate-500'>No epics to track yet.</p>
        )}
      </section>
    </div>
  );
}
