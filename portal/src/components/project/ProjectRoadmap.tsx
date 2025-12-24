import { ProjectDetail } from '../../types/domain';
import { useDomainModal } from '../domain/DomainModalProvider';

export function ProjectRoadmap({ project }: { project: ProjectDetail }) {
  const { openEpic } = useDomainModal();
  return (
    <section className='rounded-3xl border border-white/70 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-slate-900'>Roadmap</h2>
        <span className='text-sm text-slate-500'>
          {project.epics.length} epics
        </span>
      </div>
      <div className='mt-4 space-y-4'>
        {project.epics.length > 0 ? (
          project.epics.map((epic) => (
            <button
              key={epic.id}
              type='button'
              onClick={() => openEpic(epic.id)}
              className='w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left'
            >
              <div className='flex items-center justify-between gap-3'>
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
              </div>
              <ul className='mt-3 text-sm text-slate-600 list-disc list-inside space-y-1'>
                {epic.acceptanceCriteria.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </button>
          ))
        ) : (
          <div className='text-sm text-slate-500 border border-dashed border-slate-300 rounded-2xl p-6 text-center'>
            No epics yet. Add them during planning.
          </div>
        )}
      </div>
    </section>
  );
}
