import { ProjectDetail } from '../../../types/domain';
import { ProjectRoadmap } from '../ProjectRoadmap';
import { ProjectMeetings } from '../ProjectMeetings';
import { ProjectSprints } from '../ProjectSprints';
import { stageCopy } from '../stageMeta';

interface RequirementsClientViewProps {
  project: ProjectDetail;
}

export function RequirementsClientView({
  project,
}: RequirementsClientViewProps) {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <p className='text-xs uppercase tracking-wide text-slate-500'>
          Requirements in progress
        </p>
        <h2 className='text-2xl font-semibold text-slate-900 mt-2'>
          {stageCopy[project.stage].title}
        </h2>
        <p className='text-slate-600 mt-2'>
          We’re gathering context, booking calls, and documenting the workflow
          so planning can start with clear goals.
        </p>
        <div className='mt-4 grid sm:grid-cols-3 gap-3 text-sm text-slate-600'>
          <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
            <p className='text-xs uppercase text-slate-500'>Upcoming calls</p>
            <p className='text-xl font-semibold text-slate-900'>
              {project.meetings.filter(
                (m) => new Date(m.scheduledAt) > new Date()
              ).length || 0}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
            <p className='text-xs uppercase text-slate-500'>Past sessions</p>
            <p className='text-xl font-semibold text-slate-900'>
              {project.meetings.length}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3'>
            <p className='text-xs uppercase text-slate-500'>Next milestone</p>
            <p className='text-slate-900 font-semibold'>Planning kickoff</p>
            <p className='text-xs text-slate-500'>
              Unlocked after requirements are approved
            </p>
          </div>
        </div>
      </section>

      <section className='grid lg:grid-cols-2 gap-6'>
        <ProjectMeetings meetings={project.meetings} />
        <ProjectRoadmap project={project} />
      </section>

      <ProjectSprints sprints={project.sprints} />
    </div>
  );
}
