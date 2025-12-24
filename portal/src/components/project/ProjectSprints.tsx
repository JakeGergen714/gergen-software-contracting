import { Sprint } from '../../types/domain';
import { useDomainModal } from '../domain/DomainModalProvider';

interface ProjectSprintsProps {
  sprints: Sprint[];
}

export function ProjectSprints({ sprints }: ProjectSprintsProps) {
  const { openSprint } = useDomainModal();
  const current = sprints.find((s) => s.status === 'ACTIVE');
  const past = sprints.filter((s) => s.status === 'COMPLETE');

  return (
    <section className='surface-sprint p-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
        <h2 className='text-xl font-semibold text-slate-900'>Sprints</h2>
        {current && (
          <span className='text-sm text-slate-500'>
            Active sprint: {current.name}
          </span>
        )}
      </div>
      <div className='mt-4 grid md:grid-cols-2 gap-4'>
        {current ? (
          <button
            type='button'
            onClick={() => openSprint(current.id)}
            className='rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-left'
          >
            <p className='text-sm uppercase text-emerald-600 font-semibold'>
              Current sprint
            </p>
            <p className='text-lg font-semibold text-emerald-900'>
              {current.name}
            </p>
            <p className='text-sm text-emerald-700'>{current.goal}</p>
            <p className='text-xs text-emerald-600 mt-2'>
              {new Date(current.startAt).toLocaleDateString()} –
              {new Date(current.endAt).toLocaleDateString()}
            </p>
          </button>
        ) : (
          <div className='rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500'>
            No active sprint.
          </div>
        )}
        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
          <p className='text-sm uppercase text-slate-500 font-semibold'>
            Completed sprints
          </p>
          <div className='mt-3 space-y-2 text-sm text-slate-600'>
            {past.length > 0 ? (
              past.map((sprint) => (
                <button
                  key={sprint.id}
                  type='button'
                  onClick={() => openSprint(sprint.id)}
                  className='w-full border border-slate-200 rounded-2xl px-3 py-2 text-left'
                >
                  <div className='font-semibold text-slate-800'>
                    {sprint.name}
                  </div>
                  <div className='text-xs text-slate-500'>
                    {new Date(sprint.startAt).toLocaleDateString()} -
                    {new Date(sprint.endAt).toLocaleDateString()}
                  </div>
                  {sprint.notes && (
                    <p className='text-xs text-slate-500 mt-1'>
                      {sprint.notes}
                    </p>
                  )}
                </button>
              ))
            ) : (
              <p>No completed sprints yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
