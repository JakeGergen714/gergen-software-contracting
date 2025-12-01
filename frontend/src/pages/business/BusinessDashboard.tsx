import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useServices } from '../../context/ServiceContext';
import {
  BusinessOverview,
  CreateProjectInput,
  ProjectStage,
} from '../../types/domain';

const stageLabels: Record<ProjectStage, string> = {
  REQUIREMENTS: 'Requirements',
  PLANNING: 'Planning',
  EXECUTION: 'Execution',
  MAINTAINING: 'Maintaining',
};

const stageAccent: Record<ProjectStage, string> = {
  REQUIREMENTS: 'bg-sky-100 text-sky-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  EXECUTION: 'bg-emerald-100 text-emerald-700',
  MAINTAINING: 'bg-amber-100 text-amber-700',
};

export default function BusinessDashboard() {
  const { session } = useAuthContext();
  const { business } = useServices();
  const [overview, setOverview] = useState<BusinessOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreateProjectInput>({
    name: '',
    description: '',
    kickoffCallAt: new Date().toISOString().slice(0, 16),
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let mounted = true;
    business
      .getOverview(session.business.id)
      .then((data) => {
        if (mounted) setOverview(data);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [business, session]);

  const projects = overview?.projects ?? [];
  const hasProjects = projects.length > 0;

  const nextKickoff = useMemo(() => {
    return projects
      .map((proj) => new Date(proj.kickoffCallAt))
      .sort((a, b) => a.getTime() - b.getTime())[0];
  }, [projects]);

  const onCreateProject = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!session) return;
    setCreating(true);
    setError(null);
    try {
      await business.createProject(session.business.id, form);
      const refreshed = await business.getOverview(session.business.id);
      setOverview(refreshed);
      setForm({
        name: '',
        description: '',
        kickoffCallAt: new Date().toISOString().slice(0, 16),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div
        className='min-h-[70vh] flex items-center justify-center text-slate-500'
        data-testid='business-loading'
      >
        Fetching your workspace…
      </div>
    );
  }

  if (!session || !overview) {
    return (
      <div
        className='min-h-[70vh] flex items-center justify-center text-slate-500'
        data-testid='business-empty-session'
      >
        Business session not available.
      </div>
    );
  }

  return (
    <div className='space-y-8' data-testid='business-workspace-layout'>
      <Helmet>
        <title>{overview.business.name} | Business workspace</title>
      </Helmet>
      <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200'>
        <div>
          <div className='flex items-center gap-2 text-sm font-medium text-slate-500 mb-1'>
            <span className='uppercase tracking-wider'>Business Workspace</span>
          </div>
          <h1 className='text-3xl font-display font-bold text-slate-900'>
            {overview.business.name}
          </h1>
          <p className='text-slate-600 mt-2 max-w-2xl'>
            {hasProjects
              ? 'Track your projects, approvals, and sprints in one place.'
              : 'Create your first project to kick off our work together.'}
          </p>
        </div>
        {nextKickoff && (
          <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm'>
            <div className='h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center'>
              <svg
                className='w-5 h-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div>
              <div className='text-xs font-semibold text-slate-500 uppercase tracking-wide'>
                Next Milestone
              </div>
              <div className='text-sm font-medium text-slate-900'>
                {nextKickoff.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}
      </header>

      <section className='grid lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-4'>
          {hasProjects ? (
            projects.map((proj) => (
              <Link
                to={`/business/projects/${proj.id}`}
                key={proj.id}
                className='group block bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200'
                data-testid='business-project-row'
              >
                <div className='flex flex-wrap items-center gap-3 justify-between'>
                  <h2 className='text-xl font-display font-semibold text-slate-900 group-hover:text-blue-600 transition-colors'>
                    {proj.name}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      stageAccent[proj.stage]
                    }`}
                  >
                    {stageLabels[proj.stage]}
                  </span>
                </div>
                <p className='text-slate-600 mt-2'>{proj.description}</p>
                {proj.statusNote && (
                  <div className='mt-4 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg'>
                    <svg
                      className='w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    {proj.statusNote}
                  </div>
                )}
              </Link>
            ))
          ) : (
            <div className='bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center'>
              <div className='mx-auto h-12 w-12 text-slate-300 mb-4'>
                <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-slate-900'>
                No projects yet
              </h3>
              <p className='mt-1 text-slate-500'>
                Get started by creating a new project.
              </p>
            </div>
          )}
        </div>

        <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24'>
          <h3 className='text-lg font-display font-semibold text-slate-900'>
            Start a new project
          </h3>
          <p className='text-sm text-slate-600 mt-1'>
            Describe what you need and pick a kickoff time. We’ll confirm and
            guide you through each stage.
          </p>

          <div className='mt-6 mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='flex h-2 w-2 rounded-full bg-blue-500'></span>
              <p className='text-xs font-bold text-blue-700 uppercase tracking-wide'>
                Guided Setup
              </p>
            </div>
            <p className='text-sm text-slate-700 mb-3'>
              Not sure where to start? Use our wizard to seed your project with
              industry-standard epics.
            </p>
            <Link
              to='/business/intake'
              className='block w-full text-center rounded-lg bg-white border border-blue-200 text-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-50 transition-colors shadow-sm'
            >
              Launch Intake Wizard
            </Link>
          </div>

          <div className='relative py-2'>
            <div
              className='absolute inset-0 flex items-center'
              aria-hidden='true'
            >
              <div className='w-full border-t border-slate-200' />
            </div>
            <div className='relative flex justify-center'>
              <span className='bg-white px-2 text-xs text-slate-400 uppercase tracking-wide'>
                Or Quick Create
              </span>
            </div>
          </div>

          <form className='mt-4 space-y-4' onSubmit={onCreateProject}>
            <label className='block text-sm font-medium text-slate-700'>
              Project name
              <input
                required
                className='mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                placeholder='e.g. Client Portal Redesign'
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label className='block text-sm font-medium text-slate-700'>
              Description
              <textarea
                required
                rows={3}
                className='mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none'
                placeholder='Briefly describe the goals...'
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </label>
            <label className='block text-sm font-medium text-slate-700'>
              Preferred kickoff time
              <input
                required
                type='datetime-local'
                className='mt-1 block w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-all outline-none'
                value={form.kickoffCallAt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    kickoffCallAt: e.target.value,
                  }))
                }
              />
            </label>
            {error && (
              <div className='rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm'>
                {error}
              </div>
            )}
            <button
              type='submit'
              disabled={creating}
              className='w-full rounded-xl bg-slate-900 text-white px-6 py-3 font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl hover:-translate-y-0.5'
            >
              {creating ? 'Creating…' : 'Create Project'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
