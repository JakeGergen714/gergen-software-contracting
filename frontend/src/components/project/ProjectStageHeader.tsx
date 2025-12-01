import { ReactNode, useMemo } from 'react';
import { ProjectDetail } from '../../types/domain';
import { stageCopy, stageOrder } from './stageMeta';

interface ProjectStageHeaderProps {
  project: ProjectDetail;
  children?: ReactNode;
}

export function ProjectStageHeader({
  project,
  children,
}: ProjectStageHeaderProps) {
  const currentStageIdx = useMemo(
    () => stageOrder.indexOf(project.stage),
    [project.stage]
  );

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-2'>
          <p className='text-sm uppercase tracking-wide text-slate-500'>
            Project
          </p>
          <h1 className='text-3xl font-semibold text-slate-900'>
            {project.name}
          </h1>
          <p className='text-slate-600'>{project.description}</p>
        </div>
        <div className='space-y-4'>
          <div className='flex items-center gap-3 text-sm font-semibold text-slate-700'>
            <span>Stage</span>
            <span className='px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs'>
              {stageCopy[project.stage].title}
            </span>
          </div>
          <div className='flex gap-2'>
            {stageOrder.map((stage, idx) => (
              <div key={stage} className='flex-1 flex items-center'>
                <div
                  className={`h-2 flex-1 rounded-full ${
                    idx <= currentStageIdx ? 'bg-sky-500' : 'bg-slate-200'
                  }`}
                />
                {idx < stageOrder.length - 1 && (
                  <div className='w-2 h-2' aria-hidden />
                )}
              </div>
            ))}
          </div>
          <p className='text-sm text-slate-500'>
            {stageCopy[project.stage].blurb}
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}
