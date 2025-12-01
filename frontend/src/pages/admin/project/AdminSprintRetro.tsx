import { useMemo } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';

export default function AdminSprintRetro() {
  const { project } = useProjectWorkspace();
  const stats = useMemo(() => {
    const done = project.stories.filter(
      (story) => story.stage === 'DONE'
    ).length;
    const total = project.stories.length || 1;
    return {
      done,
      predictability: Math.round((done / total) * 100),
      incidents: project.meetings.filter((m) => m.type === 'REVIEW').length,
    };
  }, [project.stories, project.meetings]);

  return (
    <div className='space-y-6'>
      <section className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_15px_45px_rgba(15,23,42,0.08)]'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Predictability
          </p>
          <p className='text-3xl font-semibold text-slate-900'>
            {stats.predictability}%
          </p>
          <p className='text-sm text-slate-500'>of committed stories shipped</p>
        </div>
        <div className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_15px_45px_rgba(15,23,42,0.08)]'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Stories shipped
          </p>
          <p className='text-3xl font-semibold text-slate-900'>{stats.done}</p>
          <p className='text-sm text-slate-500'>total this iteration</p>
        </div>
        <div className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_15px_45px_rgba(15,23,42,0.08)]'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Review sessions
          </p>
          <p className='text-3xl font-semibold text-slate-900'>
            {stats.incidents}
          </p>
          <p className='text-sm text-slate-500'>action items captured</p>
        </div>
      </section>

      <section className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)]'>
        <div className='flex flex-col gap-2'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-400'>
            Retro talking points
          </p>
          <h3 className='text-xl font-semibold text-slate-900'>
            What felt great · What felt rough
          </h3>
        </div>
        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          <div className='rounded-2xl border border-emerald-100 bg-emerald-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-emerald-800'>
              Went well
            </p>
            <ul className='mt-2 space-y-2 text-sm text-emerald-900'>
              <li>• Daily standups stayed under 10 minutes.</li>
              <li>• Monitoring caught 2 regressions before prod.</li>
              <li>• QA automation shaved a day off regression testing.</li>
            </ul>
          </div>
          <div className='rounded-2xl border border-rose-100 bg-rose-50 p-4'>
            <p className='text-xs font-semibold uppercase tracking-wide text-rose-800'>
              Needs attention
            </p>
            <ul className='mt-2 space-y-2 text-sm text-rose-900'>
              <li>• Acceptance criteria drifting late in sprint.</li>
              <li>• Review queue backed up mid-week.</li>
              <li>• Retro notes not published to Confluence.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
