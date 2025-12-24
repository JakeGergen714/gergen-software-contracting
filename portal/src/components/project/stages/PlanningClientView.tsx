import { ProjectDetail } from '../../../types/domain';
import { useDomainModal } from '../../domain/DomainModalProvider';

interface PlanningClientViewProps {
  project: ProjectDetail;
}

export function PlanningClientView({ project }: PlanningClientViewProps) {
  const { openEpic } = useDomainModal();
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <h2 className='text-2xl font-semibold text-slate-900'>
          Feature approvals
        </h2>
        <p className='text-slate-600 mt-2'>
          Review the functionality we plan to ship. Approving these epics gives
          the team green-light to move into execution.
        </p>
        <div className='mt-6 grid gap-4'>
          {project.epics.map((epic) => (
            <details
              key={epic.id}
              className='rounded-2xl border border-slate-100 bg-slate-50 p-4'
            >
              <summary className='flex items-center justify-between cursor-pointer gap-4'>
                <div className='flex items-center gap-3'>
                  <span
                    className='w-2 h-2 rounded-full'
                    style={{ backgroundColor: epic.color }}
                  />
                  <div>
                    <p className='text-lg font-semibold text-slate-900'>
                      {epic.name}
                    </p>
                    <p className='text-sm text-slate-500'>{epic.description}</p>
                  </div>
                </div>
                <span className='text-xs font-semibold px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-200'>
                  {epic.status.replace('_', ' ').toLowerCase()}
                </span>
                <button
                  type='button'
                  className='text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700'
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openEpic(epic.id);
                  }}
                >
                  Open modal
                </button>
              </summary>
              <div className='mt-3 text-sm text-slate-600 space-y-2'>
                <p className='font-medium text-slate-800'>What you’ll get:</p>
                <ul className='list-disc list-inside space-y-1'>
                  {epic.acceptanceCriteria.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
          {project.epics.length === 0 && (
            <div className='text-sm text-slate-500 border border-dashed border-slate-300 rounded-2xl p-6 text-center'>
              Planning is still in progress. We’ll notify you when the first
              features are ready to review.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
