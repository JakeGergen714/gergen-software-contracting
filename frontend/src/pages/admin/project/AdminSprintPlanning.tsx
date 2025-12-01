import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useServices } from '../../../context/ServiceContext';
import { Sprint, Story, SprintAllocation } from '../../../types/domain';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useDomainModal } from '../../../components/domain/DomainModalProvider';

const statusStyles: Record<string, string> = {
  ACTIVE: 'border-sky-200 bg-sky-50 text-sky-800',
  PLANNED: 'border-amber-200 bg-amber-50 text-amber-800',
  COMPLETE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

type SprintDraft = {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
};

const DEFAULT_SPRINT_LENGTH_DAYS = 14;

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const toDisplayDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString();

const nextSprintName = (sprints: Sprint[]) => {
  let highest = 0;
  sprints.forEach((sprint) => {
    const match = sprint.name.match(/(\d+)(?!.*\d)/);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (!Number.isNaN(value)) {
        highest = Math.max(highest, value);
      }
    }
  });
  return `Sprint ${highest + 1}`;
};

const buildSprintDraft = (existingSprints: Sprint[]): SprintDraft => {
  const sortedByEnd = [...existingSprints].sort(
    (a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime()
  );
  const reference = sortedByEnd[0];
  const start = reference ? new Date(reference.endAt) : new Date();
  if (reference) {
    start.setDate(start.getDate() + 1);
  }
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + DEFAULT_SPRINT_LENGTH_DAYS);
  return {
    name: nextSprintName(existingSprints),
    goal: '',
    startDate: toInputDate(start),
    endDate: toInputDate(end),
  };
};

export default function AdminSprintPlanning() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();
  const { openStory, openSprint } = useDomainModal();
  const [selectedSprintId, setSelectedSprintId] = useState(() => {
    const active = project.sprints.find((s) => s.status === 'ACTIVE');
    return active?.id ?? project.sprints[0]?.id ?? '';
  });
  const selectedSprint = project.sprints.find((s) => s.id === selectedSprintId);

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectorExpanded, setSelectorExpanded] = useState(false);
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [sprintDraft, setSprintDraft] = useState(() =>
    buildSprintDraft(project.sprints)
  );
  const [savingSprint, setSavingSprint] = useState(false);
  const [selectedBacklogIds, setSelectedBacklogIds] = useState<string[]>([]);
  const [allocations, setAllocations] = useState<SprintAllocation[]>([]);

  useEffect(() => {
    if (selectedSprint?.allocations) {
      setAllocations(selectedSprint.allocations);
    } else {
      setAllocations([]);
    }
  }, [selectedSprint]);

  const handleAllocationChange = (userId: string, hours: number) => {
    if (!selectedSprint) return;
    setAllocations((prev) => {
      const existing = prev.find((a) => a.userId === userId);
      if (existing) {
        return prev.map((a) =>
          a.userId === userId ? { ...a, allocatedHours: hours } : a
        );
      } else {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            sprintId: selectedSprint.id,
            userId,
            allocatedHours: hours,
          },
        ];
      }
    });
  };

  const saveAllocations = async () => {
    if (!selectedSprint) return;
    setUpdating(true);
    try {
      const updatedAllocations = await projectService.updateSprintAllocations(
        project.id,
        selectedSprint.id,
        allocations
      );
      const updatedSprints = project.sprints.map((s) =>
        s.id === selectedSprint.id
          ? { ...s, allocations: updatedAllocations }
          : s
      );
      setProject({ ...project, sprints: updatedSprints });
    } catch (err) {
      console.error(err);
      setError('Failed to save allocations');
    } finally {
      setUpdating(false);
    }
  };

  const sortedSprints = useMemo(
    () =>
      [...project.sprints].sort(
        (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
      ),
    [project.sprints]
  );

  const nextSprintTemplate = useMemo(
    () => buildSprintDraft(project.sprints),
    [project.sprints]
  );

  useEffect(() => {
    if (!selectedSprintId && sortedSprints[0]) {
      setSelectedSprintId(sortedSprints[0].id);
    } else if (
      selectedSprintId &&
      !sortedSprints.some((sprint) => sprint.id === selectedSprintId) &&
      sortedSprints[0]
    ) {
      setSelectedSprintId(sortedSprints[0].id);
    }
  }, [selectedSprintId, sortedSprints]);

  const storiesBySprint = useMemo(() => {
    const map = new Map<string, Story[]>();
    project.stories.forEach((story) => {
      if (!story.sprintId) return;
      const bucket = map.get(story.sprintId) ?? [];
      bucket.push(story);
      map.set(story.sprintId, bucket);
    });
    return map;
  }, [project.stories]);

  const selectedStories = selectedSprint
    ? storiesBySprint.get(selectedSprint.id) ?? []
    : [];

  const storyIndexLookup = useMemo(() => {
    const map = new Map<string, number>();
    project.stories.forEach((story, index) => map.set(story.id, index));
    return map;
  }, [project.stories]);

  const plannedStories = useMemo(() => {
    return [...selectedStories].sort((a, b) => {
      const fallbackA = storyIndexLookup.get(a.id) ?? 0;
      const fallbackB = storyIndexLookup.get(b.id) ?? 0;
      const orderA =
        a.planningOrder === null || a.planningOrder === undefined
          ? fallbackA
          : a.planningOrder;
      const orderB =
        b.planningOrder === null || b.planningOrder === undefined
          ? fallbackB
          : b.planningOrder;
      return orderA - orderB;
    });
  }, [selectedStories, storyIndexLookup]);

  const plannedPoints = useMemo(
    () => plannedStories.reduce((sum, story) => sum + (story.points ?? 0), 0),
    [plannedStories]
  );

  const readyBacklog = useMemo(
    () =>
      project.stories.filter(
        (story) => story.stage === 'READY' && !story.sprintId
      ),
    [project.stories]
  );

  const unestimatedPlanned = useMemo(
    () =>
      plannedStories.filter(
        (story) => story.points === null || story.points === undefined
      ).length,
    [plannedStories]
  );

  const readyWithoutPoints = useMemo(
    () =>
      readyBacklog.filter(
        (story) => story.points === null || story.points === undefined
      ).length,
    [readyBacklog]
  );

  const carryOverStories = useMemo(() => {
    // Find the most recently completed sprint
    const completedSprints = sortedSprints.filter(
      (s) => s.status === 'COMPLETE'
    );
    if (completedSprints.length === 0) return [];

    const lastCompleted = completedSprints[0];
    const stories = storiesBySprint.get(lastCompleted.id) ?? [];

    // Find stories that are not DONE
    return stories.filter((s) => s.stage !== 'DONE');
  }, [sortedSprints, storiesBySprint]);

  const sprintStats = useMemo(
    () =>
      sortedSprints.map((sprint) => {
        const stories = storiesBySprint.get(sprint.id) ?? [];
        const done = stories.filter((story) => story.stage === 'DONE').length;
        const total = stories.length;
        const points = stories.reduce(
          (sum, story) => sum + (story.points ?? 0),
          0
        );
        const donePoints = stories.reduce(
          (sum, story) =>
            sum + (story.stage === 'DONE' ? story.points ?? 0 : 0),
          0
        );
        const completion = total === 0 ? 0 : Math.round((done / total) * 100);
        return { sprint, stories, done, total, points, completion, donePoints };
      }),
    [sortedSprints, storiesBySprint]
  );

  const velocityInsights = useMemo(() => {
    const completed = sprintStats.filter(
      ({ sprint }) => sprint.status === 'COMPLETE'
    );
    const recent = completed.slice(0, 3);
    const averageDonePoints =
      recent.length === 0
        ? 0
        : Math.round(
            recent.reduce((sum, stat) => sum + stat.donePoints, 0) /
              recent.length
          );
    return {
      averageDonePoints,
      lastCompletedPoints: recent[0]?.donePoints ?? 0,
    };
  }, [sprintStats]);

  const plannedVsAverageDelta =
    velocityInsights.averageDonePoints > 0
      ? plannedPoints - velocityInsights.averageDonePoints
      : null;

  const handleAddStoryToSprint = async (story: Story) => {
    if (!selectedSprint) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        sprintId: selectedSprint.id,
        stage: story.stage,
        planningOrder: plannedStories.length + 1,
      });
      setProject(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not assign story to sprint.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAddToSprint = async () => {
    if (!selectedSprint || selectedBacklogIds.length === 0) return;
    setUpdating(true);
    setError(null);
    try {
      let current = project;
      // Process sequentially to maintain order if needed, or just parallel
      for (const storyId of selectedBacklogIds) {
        const story = current.stories.find((s) => s.id === storyId);
        if (!story) continue;
        current = await projectService.updateStory(current.id, storyId, {
          epicId: story.epicId,
          title: story.title,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          points: story.points,
          sprintId: selectedSprint.id,
          stage: story.stage,
          planningOrder: plannedStories.length + 1, // This might need better logic for bulk
        });
      }
      setProject(current);
      setSelectedBacklogIds([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not assign stories to sprint.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const toggleBacklogSelection = (storyId: string) => {
    setSelectedBacklogIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleRemoveStoryFromSprint = async (story: Story) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        sprintId: null,
        stage: 'READY',
        planningOrder: null,
      });
      setProject(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not remove story from sprint.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const persistStorySequence = async (orderedStories: Story[]) => {
    setUpdating(true);
    setError(null);
    try {
      let current = project;
      for (let i = 0; i < orderedStories.length; i += 1) {
        const story = orderedStories[i];
        current = await projectService.updateStory(project.id, story.id, {
          epicId: story.epicId,
          title: story.title,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          points: story.points,
          sprintId: story.sprintId ?? null,
          stage: story.stage,
          planningOrder: i + 1,
        });
      }
      setProject(current);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not reorder sprint stories.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleReorderStory = async (
    storyId: string,
    direction: 'up' | 'down'
  ) => {
    const ordered = plannedStories;
    const index = ordered.findIndex((story) => story.id === storyId);
    if (index === -1) return;
    const targetIndex = index + (direction === 'up' ? -1 : 1);
    if (targetIndex < 0 || targetIndex >= ordered.length) return;
    const swapped = [...ordered];
    [swapped[index], swapped[targetIndex]] = [
      swapped[targetIndex],
      swapped[index],
    ];
    await persistStorySequence(swapped);
  };

  const handleSprintSelect = (sprintId: string) => {
    setSelectedSprintId(sprintId);
    setSelectorExpanded(false);
  };

  const toggleSelector = () => {
    setSelectorExpanded((prev) => !prev);
  };

  const handleDeleteSprint = async (sprintId: string) => {
    setError(null);
    setDeletingSprintId(sprintId);
    try {
      const updated = await projectService.deleteSprint(project.id, sprintId);
      setProject(updated);
      setSelectedSprintId((prev) => (prev === sprintId ? '' : prev));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete sprint. Please retry.'
      );
    } finally {
      setDeletingSprintId(null);
    }
  };

  const handleCreateSprint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingSprint(true);
    setError(null);
    try {
      const startAt = new Date(
        `${sprintDraft.startDate}T00:00:00`
      ).toISOString();
      const endAt = new Date(`${sprintDraft.endDate}T00:00:00`).toISOString();
      const updated = await projectService.createSprint(project.id, {
        name: sprintDraft.name.trim(),
        goal: sprintDraft.goal.trim(),
        startAt,
        endAt,
      });
      setProject(updated);
      setCreateOpen(false);
      setSprintDraft(buildSprintDraft(updated.sprints));
      const newest = [...updated.sprints].sort(
        (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
      )[0];
      setSelectedSprintId(newest?.id ?? selectedSprintId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not create sprint. Please retry.'
      );
    } finally {
      setSavingSprint(false);
    }
  };

  const selectorLabel = selectedSprint
    ? `${selectedSprint.name} • ${new Date(
        selectedSprint.startAt
      ).toLocaleDateString()} – ${new Date(
        selectedSprint.endAt
      ).toLocaleDateString()}`
    : 'No sprint selected';

  return (
    <section className='space-y-5'>
      {error && (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          {error}
        </div>
      )}
      <section className='surface-sprint p-5'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <button
            type='button'
            onClick={toggleSelector}
            className='flex flex-1 items-center justify-between gap-3 text-left'
          >
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Sprint selection
              </p>
              <p className='text-sm font-semibold text-slate-900'>
                {selectorLabel}
              </p>
            </div>
            <div className='flex items-center gap-2 text-xs font-semibold text-slate-600'>
              <span>{selectorExpanded ? 'Hide list' : 'Show list'}</span>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 ${
                  selectorExpanded ? 'bg-slate-900 text-white' : 'bg-white'
                }`}
                aria-hidden='true'
              >
                <svg
                  className={`h-4 w-4 transition-transform ${
                    selectorExpanded ? 'rotate-180' : ''
                  }`}
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path d='M3 7h14l-7 8z' />
                </svg>
              </span>
            </div>
          </button>
          <button
            type='button'
            onClick={() => {
              setSprintDraft(nextSprintTemplate);
              setCreateOpen(true);
            }}
            className='rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow disabled:opacity-50'
          >
            Create sprint
          </button>
        </div>
        {selectorExpanded && (
          <div className='mt-4 space-y-3'>
            {sprintStats.map(({ sprint, completion, points }) => {
              const isSelected = sprint.id === selectedSprintId;
              return (
                <div
                  key={sprint.id}
                  className={`w-full rounded-xl border px-3 py-3 text-left text-sm shadow-sm transition ${
                    isSelected
                      ? 'border-sky-400 bg-sky-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type='button'
                    onClick={() => handleSprintSelect(sprint.id)}
                    className='flex w-full items-center justify-between gap-2 text-left'
                  >
                    <div>
                      <p className='font-semibold text-slate-900'>
                        {sprint.name}
                      </p>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                        {new Date(sprint.startAt).toLocaleDateString()} –{' '}
                        {new Date(sprint.endAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        statusStyles[sprint.status] ??
                        'border-slate-200 text-slate-600'
                      }`}
                    >
                      {sprint.status.toLowerCase()}
                    </span>
                  </button>
                  <div className='mt-2 flex items-center justify-between text-xs text-slate-600'>
                    <span>{points} pts</span>
                    <div className='flex items-center gap-2'>
                      <span>{completion}% done</span>
                      {sprint.status !== 'ACTIVE' && (
                        <button
                          type='button'
                          onClick={() => handleDeleteSprint(sprint.id)}
                          className='rounded-md border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700 disabled:opacity-50'
                          disabled={deletingSprintId === sprint.id}
                        >
                          {deletingSprintId === sprint.id
                            ? 'Deleting…'
                            : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {sprintStats.length === 0 && (
              <p className='rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500'>
                No sprints scheduled yet.
              </p>
            )}
          </div>
        )}
      </section>
      <section className='surface-sprint bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-5 text-white shadow-[0_35px_80px_rgba(15,23,42,0.55)]'>
        <div className='grid gap-4 md:grid-cols-3'>
          <article className='rounded-2xl border border-white/20 bg-white/5 p-4 shadow-inner backdrop-blur'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70'>
              Velocity guardrail
            </p>
            <p className='mt-2 text-3xl font-semibold text-white'>
              {velocityInsights.averageDonePoints || '—'} pts
            </p>
            <p className='text-xs text-white/70'>
              Avg done across last 3 completed sprints
            </p>
            <p className='mt-3 text-sm text-white'>
              Planning {plannedPoints} pts{' '}
              {plannedVsAverageDelta !== null && (
                <span className='font-semibold'>
                  ({plannedVsAverageDelta >= 0 ? '+' : ''}
                  {plannedVsAverageDelta} vs avg)
                </span>
              )}
            </p>
          </article>
          <article className='rounded-2xl border border-white/20 bg-white/5 p-4 shadow-inner backdrop-blur'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70'>
              Estimation hygiene
            </p>
            <div className='mt-2 space-y-1 text-sm'>
              <p>
                <span className='text-2xl font-semibold text-white'>
                  {unestimatedPlanned}
                </span>{' '}
                planned stories missing points
              </p>
              <p>
                <span className='text-2xl font-semibold text-white'>
                  {readyWithoutPoints}
                </span>{' '}
                READY backlog items unestimated
              </p>
            </div>
            <p className='mt-2 text-xs text-white/70'>
              Scrum masters can zero in on these before kickoff.
            </p>
          </article>
          <article className='rounded-2xl border border-white/20 bg-white/5 p-4 shadow-inner backdrop-blur'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70'>
              Next sprint scaffold
            </p>
            <p className='mt-2 text-2xl font-semibold text-white'>
              {nextSprintTemplate.name}
            </p>
            <p className='text-sm text-white'>
              {toDisplayDate(nextSprintTemplate.startDate)} –{' '}
              {toDisplayDate(nextSprintTemplate.endDate)}
            </p>
            <p className='mt-2 text-xs text-white/70'>
              Auto-starts the day after the previous sprint ends.
            </p>
          </article>
        </div>
      </section>
      <div className='space-y-5'>
        {selectedSprint ? (
          <>
            <section className='surface-sprint p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    {selectedSprint.status === 'COMPLETE'
                      ? 'Completed sprint'
                      : 'Planning sprint'}
                  </p>
                  <h2 className='text-xl font-semibold text-slate-900'>
                    {selectedSprint.name}
                  </h2>
                  <p className='text-sm text-slate-500'>
                    {new Date(selectedSprint.startAt).toLocaleDateString()} –{' '}
                    {new Date(selectedSprint.endAt).toLocaleDateString()} •{' '}
                    {plannedStories.length} stories • {plannedPoints} pts
                  </p>
                </div>
                <div className='flex flex-col items-end gap-2 text-xs text-slate-600'>
                  <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600'>
                    <p className='font-semibold text-slate-900'>Goal</p>
                    <p className='max-w-xs text-xs text-slate-500'>
                      {selectedSprint.goal || 'Define sprint goal'}
                    </p>
                  </div>
                  {selectedSprint.status !== 'ACTIVE' && (
                    <button
                      type='button'
                      onClick={async () => {
                        setUpdating(true);
                        setError(null);
                        try {
                          const updated = await projectService.startSprint(
                            project.id,
                            selectedSprint.id
                          );
                          setProject(updated);
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : 'Could not start sprint.'
                          );
                        } finally {
                          setUpdating(false);
                        }
                      }}
                      className='rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50'
                      disabled={updating}
                    >
                      Start sprint
                    </button>
                  )}
                  <button
                    type='button'
                    className='text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700'
                    onClick={() => openSprint(selectedSprint.id)}
                  >
                    Open sprint modal
                  </button>
                </div>
              </div>
            </section>

            <section className='surface-sprint p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <h3 className='text-base font-semibold text-slate-900'>
                    Planned lineup
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Arrange the execution order and drop anything that no longer
                    fits.
                  </p>
                </div>
                <span className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600'>
                  {plannedStories.length} in sprint
                </span>
              </div>
              <div className='mt-4 space-y-3'>
                {plannedStories.length === 0 && (
                  <p className='rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500'>
                    No stories planned yet. Pull items from the Ready backlog
                    below.
                  </p>
                )}
                {plannedStories.map((story, index) => (
                  <div
                    key={story.id}
                    className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-sm'
                  >
                    <div>
                      <button
                        type='button'
                        className='font-semibold text-slate-900 hover:underline'
                        onClick={() => openStory(story.id)}
                      >
                        {index + 1}. {story.title}
                      </button>
                      <p className='text-xs text-slate-500'>
                        {story.points ?? '—'} pts •{' '}
                        {story.acceptanceCriteria.length} checks
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-xs'>
                      <button
                        type='button'
                        onClick={() => handleReorderStory(story.id, 'up')}
                        className='rounded-full border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600 disabled:opacity-40'
                        disabled={index === 0 || updating}
                      >
                        Up
                      </button>
                      <button
                        type='button'
                        onClick={() => handleReorderStory(story.id, 'down')}
                        className='rounded-full border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-600 disabled:opacity-40'
                        disabled={
                          index === plannedStories.length - 1 || updating
                        }
                      >
                        Down
                      </button>
                      <button
                        type='button'
                        onClick={() => handleRemoveStoryFromSprint(story)}
                        className='rounded-full border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-700 disabled:opacity-40'
                        disabled={updating}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {carryOverStories.length > 0 && (
              <section className='surface-sprint border border-amber-200 bg-amber-50/50 p-5'>
                <div className='flex flex-wrap items-center justify-between gap-3'>
                  <div>
                    <h3 className='text-base font-semibold text-amber-900'>
                      Carry-over candidates
                    </h3>
                    <p className='text-xs text-amber-700'>
                      Incomplete work from the previous sprint.
                    </p>
                  </div>
                  <span className='rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-semibold text-amber-800'>
                    {carryOverStories.length} items
                  </span>
                </div>
                <div className='mt-3 space-y-3'>
                  {carryOverStories.map((story) => (
                    <div
                      key={story.id}
                      className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm shadow-sm'
                    >
                      <div>
                        <button
                          type='button'
                          className='font-semibold text-slate-900 hover:underline'
                          onClick={() => openStory(story.id)}
                        >
                          {story.title}
                        </button>
                        <p className='text-xs text-slate-500'>
                          {story.points ?? '—'} pts •{' '}
                          {story.stage.toLowerCase()}
                        </p>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleAddStoryToSprint(story)}
                        className='rounded-full bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50'
                        disabled={updating}
                      >
                        Move to current
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className='surface-sprint border border-dashed border-slate-200 p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <h3 className='text-base font-semibold text-slate-900'>
                    Ready backlog
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Pull READY stories into the sprint plan.
                  </p>
                </div>
                <div className='flex items-center gap-3'>
                  {selectedBacklogIds.length > 0 && (
                    <button
                      type='button'
                      onClick={handleBulkAddToSprint}
                      className='rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50'
                      disabled={updating}
                    >
                      Add {selectedBacklogIds.length} to sprint
                    </button>
                  )}
                  <span className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600'>
                    {readyBacklog.length} available
                  </span>
                </div>
              </div>
              <div className='mt-3 space-y-3'>
                {readyBacklog.length === 0 && (
                  <p className='rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500'>
                    No READY stories outside of sprints.
                  </p>
                )}
                {readyBacklog.map((story) => {
                  const isSelected = selectedBacklogIds.includes(story.id);
                  return (
                    <div
                      key={story.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm shadow-sm transition ${
                        isSelected
                          ? 'border-sky-300 bg-sky-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
                          checked={isSelected}
                          onChange={() => toggleBacklogSelection(story.id)}
                        />
                        <div>
                          <button
                            type='button'
                            className='font-semibold text-slate-900 hover:underline text-left'
                            onClick={() => openStory(story.id)}
                          >
                            {story.title}
                          </button>
                          <p className='text-xs text-slate-500'>
                            {story.points ?? '—'} pts •{' '}
                            {story.acceptanceCriteria.length} checks
                          </p>
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleAddStoryToSprint(story)}
                        className='rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                        disabled={updating}
                      >
                        Add
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className='surface-sprint p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <h3 className='text-base font-semibold text-slate-900'>
                    Capacity Planning
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Allocate hours for team members in this sprint.
                  </p>
                </div>
                <button
                  onClick={saveAllocations}
                  disabled={updating}
                  className='rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50'
                >
                  Save Capacity
                </button>
              </div>
              <div className='mt-4 space-y-3'>
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => {
                    const allocation = allocations.find(
                      (a) => a.userId === member.userId
                    );
                    const hours = allocation?.allocatedHours ?? 0;
                    return (
                      <div
                        key={member.id}
                        className='flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm'
                      >
                        <div>
                          <p className='font-semibold text-slate-900'>
                            {member.userId}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {member.role}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <input
                            type='number'
                            min='0'
                            className='w-20 rounded-md border border-slate-300 px-2 py-1 text-right'
                            value={hours}
                            onChange={(e) =>
                              handleAllocationChange(
                                member.userId,
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                          <span className='text-xs text-slate-500'>hours</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className='text-xs text-slate-500'>
                    No team members found. Add members to the project to plan
                    capacity.
                  </p>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className='rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500'>
            No sprint selected. Create or select a sprint to plan work.
          </div>
        )}
      </div>

      <Modal
        title='Create sprint'
        description='Define the next run before you begin pulling stories into it.'
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <button
              type='button'
              className='rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700'
              onClick={() => setCreateOpen(false)}
              disabled={savingSprint}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='create-sprint-form'
              className='rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50'
              disabled={
                savingSprint ||
                !sprintDraft.name.trim() ||
                !sprintDraft.startDate ||
                !sprintDraft.endDate
              }
            >
              {savingSprint ? 'Creating…' : 'Create sprint'}
            </button>
          </>
        }
      >
        <form
          id='create-sprint-form'
          className='space-y-4 text-sm text-slate-700'
          onSubmit={handleCreateSprint}
        >
          <label className='flex flex-col gap-1'>
            Name
            <input
              className='rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-semibold text-slate-700'
              value={sprintDraft.name}
              readOnly
            />
            <span className='text-[11px] text-slate-500'>
              Names auto-sequence to preserve reporting history.
            </span>
          </label>
          <label className='flex flex-col gap-1'>
            Goal
            <textarea
              rows={3}
              className='rounded-md border border-slate-300 px-2 py-1'
              value={sprintDraft.goal}
              onChange={(e) =>
                setSprintDraft((prev) => ({ ...prev, goal: e.target.value }))
              }
            />
          </label>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='flex flex-col gap-1'>
              Start date
              <input
                type='date'
                className='rounded-md border border-slate-300 px-2 py-1'
                value={sprintDraft.startDate}
                onChange={(e) =>
                  setSprintDraft((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
              />
            </label>
            <label className='flex flex-col gap-1'>
              End date
              <input
                type='date'
                className='rounded-md border border-slate-300 px-2 py-1'
                value={sprintDraft.endDate}
                onChange={(e) =>
                  setSprintDraft((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required
              />
            </label>
          </div>
        </form>
      </Modal>
    </section>
  );
}
