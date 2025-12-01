import { useProjectWorkspace } from '../../project/ProjectLayoutBase';

export default function BusinessProjectOverview() {
  const { project } = useProjectWorkspace();

  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6'>
      <div className='space-y-2'>
        <p className='text-sm uppercase tracking-wide text-slate-500'>
          Project
        </p>
        <h1 className='text-2xl font-semibold text-slate-900'>
          {project.name}
        </h1>
        {project.description && (
          <p className='text-sm text-slate-600'>{project.description}</p>
        )}
      </div>

      <div className='grid gap-4 sm:grid-cols-2 text-sm text-slate-700'>
        <div className='space-y-1'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Status
          </p>
          <p className='font-medium text-slate-900'>{project.stage}</p>
          {project.statusNote && (
            <p className='text-slate-600'>{project.statusNote}</p>
          )}
        </div>
        <div className='space-y-1'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Basics
          </p>
          <p>
            <span className='text-slate-500'>Kickoff:</span>{' '}
            {new Date(project.kickoffCallAt).toLocaleDateString()}
          </p>
          <p>
            <span className='text-slate-500'>Last updated:</span>{' '}
            {new Date(project.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </section>
  );
}
