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
import {
  Stack,
  Heading,
  Text,
  Kicker,
  Card,
  Tag,
  Button,
} from '../../components/ui/design-system';

const stageLabels: Record<ProjectStage, string> = {
  REQUIREMENTS: 'Requirements',
  PLANNING: 'Planning',
  EXECUTION: 'Execution',
  MAINTAINING: 'Maintaining',
};

const stageAccent: Record<ProjectStage, 'soft' | 'muted' | 'outline'> = {
  REQUIREMENTS: 'soft',
  PLANNING: 'soft',
  EXECUTION: 'soft',
  MAINTAINING: 'soft',
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
        className='min-h-[70vh] flex items-center justify-center text-text-muted'
        data-testid='business-loading'
      >
        Fetching your workspace…
      </div>
    );
  }

  if (!session || !overview) {
    return (
      <div
        className='min-h-[70vh] flex items-center justify-center text-text-muted'
        data-testid='business-empty-session'
      >
        Business session not available.
      </div>
    );
  }

  return (
    <Stack data-testid='business-workspace-layout'>
      <Helmet>
        <title>{overview.business.name} | Business workspace</title>
      </Helmet>
      <header className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-border-subtle'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <Kicker>Business Workspace</Kicker>
          </div>
          <Heading level='h1'>{overview.business.name}</Heading>
          <Text variant='muted' className='mt-2 max-w-2xl'>
            {hasProjects
              ? 'Track your projects, approvals, and sprints in one place.'
              : 'Create your first project to kick off our work together.'}
          </Text>
        </div>
        {nextKickoff && (
          <Card className='flex items-center gap-3 p-4'>
            <div className='h-10 w-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center'>
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
              <Kicker className='text-xs'>Next Milestone</Kicker>
              <div className='text-sm font-medium text-text-primary'>
                {nextKickoff.toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </div>
            </div>
          </Card>
        )}
      </header>

      <div className='grid lg:grid-cols-3 gap-6'>
        <Stack className='lg:col-span-2'>
          {hasProjects ? (
            projects.map((proj) => (
              <Link
                to={`/business/projects/${proj.id}`}
                key={proj.id}
                className='group block'
                data-testid='business-project-row'
              >
                <Card className='p-6 hover:border-brand-soft hover:shadow-md transition-all duration-200'>
                  <div className='flex flex-wrap items-center gap-3 justify-between'>
                    <Heading
                      level='h2'
                      className='text-xl group-hover:text-brand-strong transition-colors'
                    >
                      {proj.name}
                    </Heading>
                    <Tag variant={stageAccent[proj.stage]}>
                      {stageLabels[proj.stage]}
                    </Tag>
                  </div>
                  <Text variant='muted' className='mt-2'>
                    {proj.description}
                  </Text>
                  {proj.statusNote && (
                    <div className='mt-4 flex items-start gap-2 text-sm text-text-muted bg-surface-alt p-3 rounded-lg'>
                      <svg
                        className='w-4 h-4 mt-0.5 text-text-muted flex-shrink-0'
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
                </Card>
              </Link>
            ))
          ) : (
            <Card className='border-dashed p-12 text-center'>
              <div className='mx-auto h-12 w-12 text-text-muted mb-4'>
                <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <Heading level='h3' className='text-lg'>
                No projects yet
              </Heading>
              <Text variant='muted' className='mt-1'>
                Get started by creating a new project.
              </Text>
            </Card>
          )}
        </Stack>

        <Card className='p-6 h-fit sticky top-24'>
          <Heading level='h3' className='text-lg'>
            Start a new project
          </Heading>
          <Text variant='small' className='mt-1 text-text-muted'>
            Describe what you need and pick a kickoff time. We’ll confirm and
            guide you through each stage.
          </Text>

          <div className='mt-6 mb-6 p-4 bg-surface-alt rounded-xl border border-border-subtle'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='flex h-2 w-2 rounded-full bg-brand-strong'></span>
              <Kicker className='text-brand-strong'>Guided Setup</Kicker>
            </div>
            <Text variant='small' className='mb-3'>
              Not sure where to start? Use our wizard to seed your project with
              industry-standard epics.
            </Text>
            <Button variant='outline' className='w-full' asChild>
              <Link to='/business/intake'>Launch Intake Wizard</Link>
            </Button>
          </div>

          <div className='relative py-2'>
            <div
              className='absolute inset-0 flex items-center'
              aria-hidden='true'
            >
              <div className='w-full border-t border-border-subtle' />
            </div>
            <div className='relative flex justify-center'>
              <span className='bg-surface px-2 text-xs text-text-muted uppercase tracking-wide'>
                Or Quick Create
              </span>
            </div>
          </div>

          <form className='mt-4 space-y-4' onSubmit={onCreateProject}>
            <label className='block text-sm font-medium text-text-primary'>
              Project name
              <input
                required
                className='mt-1 block w-full rounded-xl border-border-subtle bg-surface-alt px-4 py-2.5 text-sm focus:border-brand-strong focus:bg-surface focus:ring-2 focus:ring-brand-soft transition-all outline-none'
                placeholder='e.g. Client Portal Redesign'
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label className='block text-sm font-medium text-text-primary'>
              Description
              <textarea
                required
                rows={3}
                className='mt-1 block w-full rounded-xl border-border-subtle bg-surface-alt px-4 py-2.5 text-sm focus:border-brand-strong focus:bg-surface focus:ring-2 focus:ring-brand-soft transition-all outline-none resize-none'
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
            <label className='block text-sm font-medium text-text-primary'>
              Preferred kickoff time
              <input
                required
                type='datetime-local'
                className='mt-1 block w-full rounded-xl border-border-subtle bg-surface-alt px-4 py-2.5 text-sm focus:border-brand-strong focus:bg-surface focus:ring-2 focus:ring-brand-soft transition-all outline-none'
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
              <div className='rounded-xl border border-destructive/20 bg-destructive/10 text-destructive px-4 py-3 text-sm'>
                {error}
              </div>
            )}
            <Button type='submit' disabled={creating} className='w-full'>
              {creating ? 'Creating…' : 'Create Project'}
            </Button>
          </form>
        </Card>
      </div>
    </Stack>
  );
}
