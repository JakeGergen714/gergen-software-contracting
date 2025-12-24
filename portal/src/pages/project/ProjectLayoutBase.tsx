import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { ProjectDetail, ProjectStage } from '../../types/domain';
import { useServices } from '../../context/ServiceContext';
import { ProjectStageHeader } from '../../components/project/ProjectStageHeader';
import { DomainModalProvider } from '../../components/domain/DomainModalProvider';
import { Stack } from '../../components/ui/container';
import { Card } from '../../components/ui/card';
import { Heading, Text } from '../../components/ui/typography';
import clsx from 'clsx';

export type ProjectNavItem = {
  id: string;
  label: string;
  description?: string;
};

export type ProjectLayoutMode = 'client' | 'admin';

export interface ProjectWorkspaceOutletContext {
  project: ProjectDetail;
  setProject: (project: ProjectDetail) => void;
  refreshProject: () => Promise<void>;
  mode: ProjectLayoutMode;
  advanceStage: (stage: ProjectStage) => Promise<void>;
  stageUpdating: boolean;
  stageError: string | null;
}

export function useProjectWorkspace(): ProjectWorkspaceOutletContext {
  return useOutletContext<ProjectWorkspaceOutletContext>();
}

interface ProjectLayoutBaseProps {
  mode: ProjectLayoutMode;
  navItems: ProjectNavItem[];
  emptyState?: ReactNode;
}

export function ProjectLayoutBase({
  mode,
  navItems,
  emptyState,
}: ProjectLayoutBaseProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { project: projectService } = useServices();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [stageUpdating, setStageUpdating] = useState(false);
  const [stageError, setStageError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setStageError(null);
    try {
      const detail = await projectService.getProject(projectId);
      setProject(detail);
    } catch (err) {
      navigate(mode === 'admin' ? '/admin' : '/business');
    } finally {
      setLoading(false);
    }
  }, [navigate, projectId, projectService, mode]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const onStageChange = useCallback(
    async (stage: ProjectStage) => {
      if (!projectId || stageUpdating) return;
      setStageUpdating(true);
      setStageError(null);
      try {
        const updated = await projectService.advanceStage(projectId, stage);
        setProject(updated);
      } catch (err) {
        setStageError(
          err instanceof Error ? err.message : 'Could not update stage'
        );
      } finally {
        setStageUpdating(false);
      }
    },
    [projectId, projectService, stageUpdating]
  );

  const outletContext = useMemo(() => {
    if (!project) return null;
    return {
      project,
      setProject,
      refreshProject: loadProject,
      mode,
      advanceStage: onStageChange,
      stageUpdating,
      stageError,
    } satisfies ProjectWorkspaceOutletContext;
  }, [project, loadProject, mode, onStageChange, stageUpdating, stageError]);

  if (loading || !project || !outletContext) {
    return (
      <div className='min-h-[40vh] flex items-center justify-center text-slate-500'>
        {loading ? 'Loading project…' : emptyState ?? 'Project unavailable'}
      </div>
    );
  }

  if (mode === 'admin') {
    return (
      <DomainModalProvider project={project} setProject={setProject}>
        <Stack gap={6}>
          <section className='rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-6 text-white shadow-[0_35px_80px_rgba(28,25,23,0.45)] border border-stone-800'>
            <Stack gap={6}>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <Text variant='eyebrow' className='text-white/70'>
                    Project workspace
                  </Text>
                  <Heading level='h1' className='text-white tracking-tight'>
                    {project.name}
                  </Heading>
                  {project.description && (
                    <Text variant='body' className='mt-1 text-white/70'>
                      {project.description}
                    </Text>
                  )}
                </div>
                <Link
                  to='/admin'
                  className='rounded-full border border-white/30 px-3 py-1 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white'
                >
                  Back to Admin
                </Link>
              </div>
              <ProjectStageHeader project={project}>
                {stageError && (
                  <div className='rounded-2xl border border-brand-strong/20 bg-brand-strong/5 px-4 py-3 text-sm text-brand-strong'>
                    {stageError}
                  </div>
                )}
              </ProjectStageHeader>
              <nav
                className='mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold'
                aria-label='Admin project navigation'
              >
                {navItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.id}
                    className={({ isActive }) =>
                      `rounded-full border px-4 py-1.5 shadow-sm transition ${
                        isActive
                          ? 'border-white/0 bg-white text-slate-900 shadow-[0_12px_30px_rgba(255,255,255,0.25)]'
                          : 'border-white/20 text-white/80 hover:bg-white/10'
                      }`
                    }
                    end={false}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </Stack>
          </section>
          <Stack gap={6}>
            <Outlet context={outletContext} />
          </Stack>
        </Stack>
      </DomainModalProvider>
    );
  }

  return (
    <DomainModalProvider project={project} setProject={setProject}>
      <Stack gap={6}>
        <ProjectStageHeader project={project}>
          {stageError && (
            <div className='rounded-2xl border border-brand-strong/20 bg-brand-strong/5 px-4 py-3 text-sm text-brand-strong'>
              {stageError}
            </div>
          )}
        </ProjectStageHeader>
        <Card className='px-4 py-3'>
          <nav
            className='flex flex-wrap items-center gap-2'
            aria-label='Project navigation'
          >
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.id}
                className={({ isActive }) =>
                  clsx(
                    'rounded-full px-4 py-1.5 transition text-sm font-semibold',
                    isActive
                      ? 'bg-brand-solid text-white shadow-lg shadow-brand-solid/25'
                      : 'text-text-secondary hover:bg-surface-muted'
                  )
                }
                end={false}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </Card>
        <Outlet context={outletContext} />
      </Stack>
    </DomainModalProvider>
  );
}
