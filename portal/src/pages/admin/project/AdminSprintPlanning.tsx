import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useServices } from '../../../context/ServiceContext';
import { Sprint, Story, SprintAllocation } from '../../../types/domain';
import { ProjectWorkspaceOutletContext } from '../../project/ProjectLayoutBase';
import { useDomainModal } from '../../../components/domain/DomainModalProvider';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Tag } from '../../../components/ui/tag';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { cn } from '../../../utils/cn';

const getSprintStatusVariant = (
  status: string
): 'neutral' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PLANNED':
      return 'neutral';
    case 'COMPLETE':
      return 'neutral';
    default:
      return 'neutral';
  }
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
  const { project, setProject } =
    useOutletContext<ProjectWorkspaceOutletContext>();
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
    if (!selectedSprintId && sortedSprints.length > 0) {
      setSelectedSprintId(sortedSprints[0].id);
    }
  }, [selectedSprintId, sortedSprints]);

  const sprintStats = useMemo(() => {
    return sortedSprints.map((sprint) => {
      const stories = project.stories.filter((s) => s.sprintId === sprint.id);
      const points = stories.reduce((sum, s) => sum + (s.points || 0), 0);
      const completed = stories.filter((s) => s.stage === 'DONE').length;
      const total = stories.length;
      const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { sprint, points, completion };
    });
  }, [sortedSprints, project.stories]);

  const plannedStories = useMemo(() => {
    if (!selectedSprint) return [];
    return project.stories
      .filter((s) => s.sprintId === selectedSprint.id)
      .sort((a, b) => (a.planningOrder ?? 0) - (b.planningOrder ?? 0));
  }, [project.stories, selectedSprint]);

  const readyBacklog = useMemo(() => {
    return project.stories.filter((s) => !s.sprintId && s.stage === 'READY');
  }, [project.stories]);

  const carryOverStories = useMemo(() => {
    if (!selectedSprint) return [];
    // Find previous sprint
    const sorted = [...project.sprints].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    const currentIndex = sorted.findIndex((s) => s.id === selectedSprint.id);
    if (currentIndex <= 0) return [];
    const prevSprint = sorted[currentIndex - 1];

    // Stories in previous sprint that are not DONE
    return project.stories.filter(
      (s) => s.sprintId === prevSprint.id && s.stage !== 'DONE'
    );
  }, [project.stories, project.sprints, selectedSprint]);

  const velocityInsights = useMemo(() => {
    const completedSprints = project.sprints
      .filter((s) => s.status === 'COMPLETE')
      .sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())
      .slice(0, 3);

    if (completedSprints.length === 0) return { averageDonePoints: 0 };

    const totalPoints = completedSprints.reduce((sum, sprint) => {
      const sprintStories = project.stories.filter(
        (s) => s.sprintId === sprint.id && s.stage === 'DONE'
      );
      return sum + sprintStories.reduce((p, s) => p + (s.points || 0), 0);
    }, 0);

    return {
      averageDonePoints: Math.round(totalPoints / completedSprints.length),
    };
  }, [project.sprints, project.stories]);

  const plannedPoints = useMemo(
    () => plannedStories.reduce((sum, s) => sum + (s.points || 0), 0),
    [plannedStories]
  );

  const plannedVsAverageDelta = useMemo(() => {
    if (!velocityInsights.averageDonePoints) return null;
    return plannedPoints - velocityInsights.averageDonePoints;
  }, [plannedPoints, velocityInsights.averageDonePoints]);

  const unestimatedPlanned = useMemo(
    () =>
      plannedStories.filter((s) => s.points === undefined || s.points === null)
        .length,
    [plannedStories]
  );

  const readyWithoutPoints = useMemo(
    () =>
      readyBacklog.filter((s) => s.points === undefined || s.points === null)
        .length,
    [readyBacklog]
  );

  const persistStorySequence = async (stories: Story[]) => {
    try {
      const updates = stories.map((story, index) => ({
        storyId: story.id,
        planningOrder: index,
      }));
      // Optimistic update
      const updatedStories = project.stories.map((s) => {
        const update = updates.find((u) => u.storyId === s.id);
        return update ? { ...s, planningOrder: update.planningOrder } : s;
      });
      setProject({ ...project, stories: updatedStories });

      // Sequential update since no bulk API
      for (const update of updates) {
        const story = project.stories.find((s) => s.id === update.storyId);
        if (story) {
          await projectService.updateStory(project.id, story.id, {
            epicId: story.epicId,
            title: story.title,
            description: story.description,
            acceptanceCriteria: story.acceptanceCriteria,
            points: story.points,
            sprintId: story.sprintId,
            stage: story.stage,
            planningOrder: update.planningOrder,
          });
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save order');
    }
  };

  const handleAddStoryToSprint = async (story: Story) => {
    if (!selectedSprint) return;
    setUpdating(true);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        sprintId: selectedSprint.id,
        stage: story.stage,
        planningOrder: story.planningOrder,
      });
      setProject(updated);
      setSelectedBacklogIds((prev) => prev.filter((id) => id !== story.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not add story to sprint.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveStoryFromSprint = async (story: Story) => {
    setUpdating(true);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        sprintId: null,
        stage: story.stage,
        planningOrder: story.planningOrder,
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

  const toggleBacklogSelection = (storyId: string) => {
    setSelectedBacklogIds((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleBulkAddToSprint = async () => {
    if (!selectedSprint || selectedBacklogIds.length === 0) return;
    setUpdating(true);
    try {
      let currentProject = project;
      for (const storyId of selectedBacklogIds) {
        const story = project.stories.find((s) => s.id === storyId);
        if (story) {
          currentProject = await projectService.updateStory(
            project.id,
            storyId,
            {
              epicId: story.epicId,
              title: story.title,
              description: story.description,
              acceptanceCriteria: story.acceptanceCriteria,
              points: story.points,
              sprintId: selectedSprint.id,
              stage: story.stage,
              planningOrder: story.planningOrder,
            }
          );
        }
      }
      setProject(currentProject);
      setSelectedBacklogIds([]);
    } catch (err) {
      setError('Some stories could not be added.');
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
    <Stack gap={5} className='pb-10'>
      {error && (
        <div className='rounded-2xl border border-brand-strong/20 bg-brand-strong/5 px-4 py-3 text-sm text-brand-strong'>
          {error}
        </div>
      )}

      <Card className='p-5'>
        <Stack gap={4}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <button
              type='button'
              onClick={toggleSelector}
              className='flex flex-1 items-center justify-between gap-3 text-left'
            >
              <div>
                <Text
                  variant='small'
                  className='font-semibold uppercase tracking-wide text-text-muted'
                >
                  Sprint selection
                </Text>
                <Text
                  variant='body'
                  className='font-semibold text-text-primary'
                >
                  {selectorLabel}
                </Text>
              </div>
              <div className='flex items-center gap-2 text-xs font-semibold text-text-muted'>
                <span>{selectorExpanded ? 'Hide list' : 'Show list'}</span>
                <span
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle transition-colors',
                    selectorExpanded
                      ? 'bg-text-primary text-white'
                      : 'bg-surface'
                  )}
                  aria-hidden='true'
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      selectorExpanded && 'rotate-180'
                    )}
                  />
                </span>
              </div>
            </button>
            <Button
              onClick={() => {
                setSprintDraft(nextSprintTemplate);
                setCreateOpen(true);
              }}
              size='sm'
            >
              Create sprint
            </Button>
          </div>

          {selectorExpanded && (
            <Stack gap={3}>
              {sprintStats.map(({ sprint, completion, points }) => {
                const isSelected = sprint.id === selectedSprintId;
                return (
                  <div
                    key={sprint.id}
                    className={cn(
                      'w-full rounded-xl border px-3 py-3 text-left text-sm shadow-sm transition',
                      isSelected
                        ? 'border-brand-solid bg-surface-raised'
                        : 'border-border-subtle bg-surface'
                    )}
                  >
                    <button
                      type='button'
                      onClick={() => handleSprintSelect(sprint.id)}
                      className='flex w-full items-center justify-between gap-2 text-left'
                    >
                      <div>
                        <Text
                          variant='body'
                          className='font-semibold text-text-primary'
                        >
                          {sprint.name}
                        </Text>
                        <Text
                          variant='small'
                          className='uppercase tracking-wide text-text-muted text-[11px]'
                        >
                          {new Date(sprint.startAt).toLocaleDateString()} –{' '}
                          {new Date(sprint.endAt).toLocaleDateString()}
                        </Text>
                      </div>
                      <Tag variant={getSprintStatusVariant(sprint.status)}>
                        {sprint.status.toLowerCase()}
                      </Tag>
                    </button>
                    <div className='mt-2 flex items-center justify-between text-xs text-text-muted'>
                      <span>{points} pts</span>
                      <div className='flex items-center gap-2'>
                        <span>{completion}% done</span>
                        {sprint.status !== 'ACTIVE' && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-auto p-0 text-brand-strong hover:text-brand-strong/80 hover:bg-transparent'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSprint(sprint.id);
                            }}
                            disabled={deletingSprintId === sprint.id}
                          >
                            {deletingSprintId === sprint.id
                              ? 'Deleting…'
                              : 'Delete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {sprintStats.length === 0 && (
                <div className='rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs text-text-muted'>
                  No sprints scheduled yet.
                </div>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      <Card className='bg-brand-solid p-5 text-white shadow-[0_35px_80px_rgba(15,23,42,0.55)] border-none'>
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
      </Card>

      <Stack gap={5}>
        {selectedSprint ? (
          <>
            <Card className='p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <Text
                    variant='small'
                    className='font-semibold uppercase tracking-wide text-text-muted'
                  >
                    {selectedSprint.status === 'COMPLETE'
                      ? 'Completed sprint'
                      : 'Planning sprint'}
                  </Text>
                  <Heading
                    level='h2'
                    className='text-xl font-semibold text-text-primary'
                  >
                    {selectedSprint.name}
                  </Heading>
                  <Text variant='body' className='text-text-muted text-sm'>
                    {new Date(selectedSprint.startAt).toLocaleDateString()} –{' '}
                    {new Date(selectedSprint.endAt).toLocaleDateString()} •{' '}
                    {plannedStories.length} stories • {plannedPoints} pts
                  </Text>
                </div>
                <div className='flex flex-col items-end gap-2 text-xs text-text-muted'>
                  <div className='rounded-xl border border-border-subtle bg-surface-alt px-4 py-2 text-sm text-text-muted'>
                    <p className='font-semibold text-text-primary'>Goal</p>
                    <p className='max-w-xs text-xs text-text-muted'>
                      {selectedSprint.goal || 'Define sprint goal'}
                    </p>
                  </div>
                  {selectedSprint.status !== 'ACTIVE' && (
                    <Button
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
                      size='sm'
                      disabled={updating}
                    >
                      Start sprint
                    </Button>
                  )}
                  <button
                    type='button'
                    className='text-[11px] font-semibold uppercase tracking-wide text-text-muted hover:text-text-primary'
                    onClick={() => openSprint(selectedSprint.id)}
                  >
                    Open sprint modal
                  </button>
                </div>
              </div>
            </Card>

            <Card className='p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
                <div>
                  <Heading
                    level='h3'
                    className='text-base font-semibold text-text-primary'
                  >
                    Planned lineup
                  </Heading>
                  <Text variant='small' className='text-text-muted'>
                    Arrange the execution order and drop anything that no longer
                    fits.
                  </Text>
                </div>
                <Tag variant='neutral'>{plannedStories.length} in sprint</Tag>
              </div>
              <Stack gap={3}>
                {plannedStories.length === 0 && (
                  <div className='rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs text-text-muted'>
                    No stories planned yet. Pull items from the Ready backlog
                    below.
                  </div>
                )}
                {plannedStories.map((story, index) => (
                  <div
                    key={story.id}
                    className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-3 text-sm shadow-sm'
                  >
                    <div>
                      <button
                        type='button'
                        className='font-semibold text-text-primary hover:underline'
                        onClick={() => openStory(story.id)}
                      >
                        {index + 1}. {story.title}
                      </button>
                      <p className='text-xs text-text-muted'>
                        {story.points ?? '—'} pts •{' '}
                        {story.acceptanceCriteria.length} checks
                      </p>
                    </div>
                    <div className='flex items-center gap-2 text-xs'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleReorderStory(story.id, 'up')}
                        disabled={index === 0 || updating}
                        className='h-7 w-7 p-0 rounded-full'
                      >
                        <ArrowUp className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleReorderStory(story.id, 'down')}
                        disabled={
                          index === plannedStories.length - 1 || updating
                        }
                        className='h-7 w-7 p-0 rounded-full'
                      >
                        <ArrowDown className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleRemoveStoryFromSprint(story)}
                        disabled={updating}
                        className='h-7 px-2 rounded-full text-brand-strong border-brand-strong/20 hover:bg-brand-strong/5 hover:text-brand-strong/80'
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </Stack>
            </Card>

            {carryOverStories.length > 0 && (
              <Card className='border-amber-200 bg-amber-50/50 p-5'>
                <div className='flex flex-wrap items-center justify-between gap-3 mb-3'>
                  <div>
                    <Heading
                      level='h3'
                      className='text-base font-semibold text-amber-900'
                    >
                      Carry-over candidates
                    </Heading>
                    <Text variant='small' className='text-amber-700'>
                      Incomplete work from the previous sprint.
                    </Text>
                  </div>
                  <Tag variant='warning' className='bg-white'>
                    {carryOverStories.length} items
                  </Tag>
                </div>
                <Stack gap={3}>
                  {carryOverStories.map((story) => (
                    <div
                      key={story.id}
                      className='flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3 py-3 text-sm shadow-sm'
                    >
                      <div>
                        <button
                          type='button'
                          className='font-semibold text-text-primary hover:underline'
                          onClick={() => openStory(story.id)}
                        >
                          {story.title}
                        </button>
                        <p className='text-xs text-text-muted'>
                          {story.points ?? '—'} pts •{' '}
                          {story.stage.toLowerCase()}
                        </p>
                      </div>
                      <Button
                        size='sm'
                        onClick={() => handleAddStoryToSprint(story)}
                        disabled={updating}
                        className='bg-amber-900 hover:bg-amber-800 text-white rounded-full'
                      >
                        Move to current
                      </Button>
                    </div>
                  ))}
                </Stack>
              </Card>
            )}

            <Card className='border-dashed border-border-subtle p-5 shadow-none'>
              <div className='flex flex-wrap items-center justify-between gap-3 mb-3'>
                <div>
                  <Heading
                    level='h3'
                    className='text-base font-semibold text-text-primary'
                  >
                    Ready backlog
                  </Heading>
                  <Text variant='small' className='text-text-muted'>
                    Pull READY stories into the sprint plan.
                  </Text>
                </div>
                <div className='flex items-center gap-3'>
                  {selectedBacklogIds.length > 0 && (
                    <Button
                      size='sm'
                      onClick={handleBulkAddToSprint}
                      disabled={updating}
                      className='rounded-full'
                    >
                      Add {selectedBacklogIds.length} to sprint
                    </Button>
                  )}
                  <Tag variant='neutral'>{readyBacklog.length} available</Tag>
                </div>
              </div>
              <Stack gap={3}>
                {readyBacklog.length === 0 && (
                  <div className='rounded-lg border border-dashed border-border-subtle px-3 py-2 text-xs text-text-muted'>
                    No READY stories outside of sprints.
                  </div>
                )}
                {readyBacklog.map((story) => {
                  const isSelected = selectedBacklogIds.includes(story.id);
                  return (
                    <div
                      key={story.id}
                      className={cn(
                        'flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm shadow-sm transition',
                        isSelected
                          ? 'border-brand-solid bg-surface-raised'
                          : 'border-border-subtle bg-surface'
                      )}
                    >
                      <div className='flex items-center gap-3'>
                        <input
                          type='checkbox'
                          className='h-4 w-4 rounded border-border-subtle text-text-primary focus:ring-brand-solid'
                          checked={isSelected}
                          onChange={() => toggleBacklogSelection(story.id)}
                        />
                        <div>
                          <button
                            type='button'
                            className='font-semibold text-text-primary hover:underline text-left'
                            onClick={() => openStory(story.id)}
                          >
                            {story.title}
                          </button>
                          <p className='text-xs text-text-muted'>
                            {story.points ?? '—'} pts •{' '}
                            {story.acceptanceCriteria.length} checks
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleAddStoryToSprint(story)}
                        disabled={updating}
                        className='rounded-full'
                      >
                        Add
                      </Button>
                    </div>
                  );
                })}
              </Stack>
            </Card>

            <Card className='p-5'>
              <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
                <div>
                  <Heading
                    level='h3'
                    className='text-base font-semibold text-text-primary'
                  >
                    Capacity Planning
                  </Heading>
                  <Text variant='small' className='text-text-muted'>
                    Allocate hours for team members in this sprint.
                  </Text>
                </div>
                <Button
                  onClick={saveAllocations}
                  disabled={updating}
                  size='sm'
                  className='rounded-full'
                >
                  Save Capacity
                </Button>
              </div>
              <Stack gap={3}>
                {project.members && project.members.length > 0 ? (
                  project.members.map((member) => {
                    const allocation = allocations.find(
                      (a) => a.userId === member.userId
                    );
                    const hours = allocation?.allocatedHours ?? 0;
                    return (
                      <div
                        key={member.id}
                        className='flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm'
                      >
                        <div>
                          <p className='font-semibold text-text-primary'>
                            {member.userId}
                          </p>
                          <p className='text-xs text-text-muted'>
                            {member.role}
                          </p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            min='0'
                            className='w-20 text-right h-8'
                            value={hours}
                            onChange={(e) =>
                              handleAllocationChange(
                                member.userId,
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                          <span className='text-xs text-text-muted'>hours</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Text variant='small' className='text-text-muted'>
                    No team members found. Add members to the project to plan
                    capacity.
                  </Text>
                )}
              </Stack>
            </Card>
          </>
        ) : (
          <div className='rounded-2xl border border-dashed border-border-subtle bg-surface px-5 py-10 text-center text-sm text-text-muted'>
            No sprint selected. Create or select a sprint to plan work.
          </div>
        )}
      </Stack>

      <Modal
        title='Create sprint'
        description='Define the next run before you begin pulling stories into it.'
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <Button
              variant='outline'
              onClick={() => setCreateOpen(false)}
              disabled={savingSprint}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Trigger form submission programmatically or change button type to submit if inside form
                // But the form is inside the modal body.
                // The Modal component renders actions outside the form.
                // So I need to trigger the form submit.
                // Or I can just call handleCreateSprint if I pass the event?
                // Actually, the form has an id 'create-sprint-form' and the button has form='create-sprint-form'
                // But the Button component might not pass the 'form' prop.
                // Let's check Button component.
              }}
              form='create-sprint-form'
              type='submit'
              disabled={
                savingSprint ||
                !sprintDraft.name.trim() ||
                !sprintDraft.startDate ||
                !sprintDraft.endDate
              }
            >
              {savingSprint ? 'Creating…' : 'Create sprint'}
            </Button>
          </>
        }
      >
        <form
          id='create-sprint-form'
          className='space-y-4 text-sm text-text-primary'
          onSubmit={handleCreateSprint}
        >
          <label className='flex flex-col gap-1'>
            Name
            <Input
              className='bg-surface-alt font-semibold text-text-primary'
              value={sprintDraft.name}
              readOnly
            />
            <span className='text-[11px] text-text-muted'>
              Names auto-sequence to preserve reporting history.
            </span>
          </label>
          <label className='flex flex-col gap-1'>
            Goal
            <Textarea
              rows={3}
              value={sprintDraft.goal}
              onChange={(e) =>
                setSprintDraft((prev) => ({ ...prev, goal: e.target.value }))
              }
            />
          </label>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='flex flex-col gap-1'>
              Start date
              <Input
                type='date'
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
              <Input
                type='date'
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
    </Stack>
  );
}
