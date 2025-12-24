import { useState, FormEvent, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Story, StoryStage, Sprint, Epic } from '../../../types/domain';
import { useServices } from '../../../context/ServiceContext';
import { ProjectWorkspaceOutletContext } from '../../project/ProjectLayoutBase';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Tag } from '../../../components/ui/tag';
import { Modal } from '../../../components/ui/Modal';
import { Plus, RotateCcw, AlertCircle } from 'lucide-react';

interface StoryDraft {
  epicId: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  points: string;
  stage: StoryStage;
  sprintId: string;
}

const defaultStoryDraft = (firstEpicId?: string): StoryDraft => ({
  epicId: firstEpicId ?? '',
  title: '',
  description: '',
  acceptanceCriteria: '',
  points: '',
  stage: 'BACKLOG',
  sprintId: '',
});

const backlogStageOptions: { key: StoryStage; label: string }[] = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'READY', label: 'Ready' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
];

const stageBadge: Record<
  StoryStage,
  'neutral' | 'warning' | 'soft' | 'success'
> = {
  BACKLOG: 'neutral',
  READY: 'soft',
  IN_PROGRESS: 'warning',
  IN_REVIEW: 'warning',
  DONE: 'success',
};

export default function AdminProjectBacklog() {
  const { project, setProject } =
    useOutletContext<ProjectWorkspaceOutletContext>();
  const { project: projectService } = useServices();
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [storyDraft, setStoryDraft] = useState<StoryDraft>(
    defaultStoryDraft(project.epics[0]?.id)
  );
  const [savingStory, setSavingStory] = useState(false);

  // Action states
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [reopeningStoryId, setReopeningStoryId] = useState<string | null>(null);

  // Derived state
  const refinedStories = useMemo(
    () => project.stories.filter((s: Story) => s.stage === 'READY'),
    [project.stories]
  );
  const backlogStories = useMemo(
    () => project.stories.filter((s: Story) => s.stage === 'BACKLOG'),
    [project.stories]
  );
  const completedStories = useMemo(
    () => project.stories.filter((s: Story) => s.stage === 'DONE'),
    [project.stories]
  );
  const recentCompletedStories = useMemo(
    () => completedStories.slice(0, 10),
    [completedStories]
  );

  const sprintLookup = useMemo(() => {
    const map = new Map<string, Sprint>();
    project.sprints.forEach((s: Sprint) => map.set(s.id, s));
    return map;
  }, [project.sprints]);

  // Handlers
  const closeStoryModal = () => {
    setStoryModalOpen(false);
    setEditingStory(null);
    setError(null);
  };

  const openStoryModal = (story?: Story) => {
    setError(null);
    if (story) {
      setEditingStory(story);
      setStoryDraft({
        epicId: story.epicId,
        title: story.title,
        description: story.description ?? '',
        acceptanceCriteria: story.acceptanceCriteria.join('\n'),
        points: story.points?.toString() ?? '',
        stage:
          story.stage === 'BACKLOG' || story.stage === 'READY'
            ? story.stage
            : 'READY',
        sprintId: story.sprintId ?? '',
      });
    } else {
      setEditingStory(null);
      setStoryDraft(defaultStoryDraft(project.epics[0]?.id));
    }
    setStoryModalOpen(true);
  };

  const handleStorySubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!storyDraft.epicId || !storyDraft.title.trim()) return;

    setSavingStory(true);
    setError(null);

    const acceptance = storyDraft.acceptanceCriteria
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      epicId: storyDraft.epicId,
      title: storyDraft.title.trim(),
      description: storyDraft.description.trim() || undefined,
      acceptanceCriteria: acceptance,
      points: storyDraft.points ? Number(storyDraft.points) : undefined,
      sprintId: storyDraft.sprintId || undefined,
      stage: storyDraft.stage,
    };

    try {
      const updated = editingStory
        ? await projectService.updateStory(project.id, editingStory.id, payload)
        : await projectService.createStory(project.id, payload);
      setProject(updated);
      closeStoryModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save story. Please retry.'
      );
    } finally {
      setSavingStory(false);
    }
  };

  const handleUpdateStoryStage = async (storyId: string, stage: StoryStage) => {
    setError(null);
    try {
      const updated = await projectService.updateStoryStage(
        project.id,
        storyId,
        stage
      );
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update story');
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    setError(null);
    setDeletingStoryId(storyId);
    try {
      const updated = await projectService.deleteStory(project.id, storyId);
      setProject(updated);
      if (editingStory && editingStory.id === storyId) {
        closeStoryModal();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete story. Please retry.'
      );
    } finally {
      setDeletingStoryId(null);
    }
  };

  const handleReopenStory = async (storyId: string) => {
    setError(null);
    setReopeningStoryId(storyId);
    try {
      const updated = await projectService.updateStoryStage(
        project.id,
        storyId,
        'READY'
      );
      setProject(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reopen story. Please retry.'
      );
    } finally {
      setReopeningStoryId(null);
    }
  };

  const renderStoryList = (stories: Story[], emptyLabel: string) => {
    if (stories.length === 0) {
      return (
        <Card className='bg-surface-alt border-dashed border-border-subtle'>
          <div className='p-4 text-center text-text-muted text-sm'>
            {emptyLabel}
          </div>
        </Card>
      );
    }

    return (
      <Stack gap={2}>
        {stories.map((story) => {
          const epic = project.epics.find((e: Epic) => e.id === story.epicId);
          return (
            <Card
              key={story.id}
              className='p-3 hover:shadow-md transition-shadow bg-surface'
            >
              <Stack direction='row' justify='between' align='start' gap={4}>
                <button
                  type='button'
                  onClick={() => openStoryModal(story)}
                  className='flex-1 text-left group'
                >
                  <Stack gap={1}>
                    <Stack direction='row' justify='between' align='center'>
                      <Text
                        weight='medium'
                        className='group-hover:text-brand-strong transition-colors text-text-primary'
                      >
                        {story.title}
                      </Text>
                    </Stack>
                    <Stack direction='row' align='center' gap={1}>
                      <Text variant='caption' className='text-text-muted'>
                        {epic ? epic.name : 'Untitled epic'}
                      </Text>
                      <Text variant='caption' className='text-text-muted'>
                        •
                      </Text>
                      <Text variant='caption' className='text-text-muted'>
                        {story.acceptanceCriteria.length} checks
                      </Text>
                    </Stack>
                    <Text
                      variant='caption'
                      className='text-text-muted line-clamp-2'
                    >
                      {story.description || 'Description not captured yet.'}
                    </Text>
                  </Stack>
                </button>

                <Stack align='end' gap={1}>
                  <Tag variant={stageBadge[story.stage]}>
                    {backlogStageOptions.find((opt) => opt.key === story.stage)
                      ?.label ?? story.stage}
                  </Tag>

                  <Text
                    variant='caption'
                    weight='medium'
                    className='text-text-primary'
                  >
                    {story.points ? `${story.points} pts` : 'Unestimated'}
                  </Text>

                  <select
                    value={story.stage}
                    onChange={(e) =>
                      handleUpdateStoryStage(
                        story.id,
                        e.target.value as StoryStage
                      )
                    }
                    className='flex h-7 w-auto rounded-md border border-border-subtle bg-surface px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-text-primary'
                  >
                    {backlogStageOptions.map((opt) => (
                      <option key={opt.key} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDeleteStory(story.id)}
                    disabled={deletingStoryId === story.id}
                    className='text-brand-strong hover:text-brand-strong/80 hover:bg-brand-strong/10 h-6 px-2 text-xs'
                  >
                    {deletingStoryId === story.id ? 'Deleting…' : 'Delete'}
                  </Button>
                </Stack>
              </Stack>
            </Card>
          );
        })}
      </Stack>
    );
  };

  return (
    <Stack gap={8}>
      {error && (
        <div className='rounded-md border border-brand-strong/20 bg-brand-strong/5 px-4 py-3 text-sm text-brand-strong flex items-center gap-2'>
          <AlertCircle className='w-4 h-4' />
          {error}
        </div>
      )}

      <Stack
        direction='row'
        justify='between'
        align='center'
        className='flex-wrap gap-4'
      >
        <Stack gap={1}>
          <Text variant='eyebrow' className='text-text-muted'>
            Backlog management
          </Text>
          <Heading level='h2'>Backlog control center</Heading>
        </Stack>
        <Button onClick={() => openStoryModal()}>
          <Plus className='w-4 h-4 mr-2' />
          Create story
        </Button>
      </Stack>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]'>
        <Stack gap={8}>
          <Card className='border-brand-soft bg-gradient-to-br from-brand-soft/50 via-white to-white'>
            <div className='p-5'>
              <Stack
                direction='row'
                justify='between'
                align='start'
                className='mb-4'
              >
                <Stack gap={1}>
                  <Text variant='eyebrow' className='text-brand-solid'>
                    Refined backlog
                  </Text>
                  <Heading level='h3' className='text-lg'>
                    Ready for the next sprint
                  </Heading>
                  <Text variant='small' className='text-text-muted'>
                    Estimated stories with clear acceptance criteria.
                  </Text>
                </Stack>
                <Tag variant='neutral' className='bg-white'>
                  {refinedStories.length} items
                </Tag>
              </Stack>
              {renderStoryList(refinedStories, 'Nothing refined yet.')}
            </div>
          </Card>

          <Card className='border-amber-200 bg-gradient-to-br from-amber-50/50 via-white to-white'>
            <div className='p-5'>
              <Stack
                direction='row'
                justify='between'
                align='start'
                className='mb-4'
              >
                <Stack gap={1}>
                  <Text variant='eyebrow' className='text-amber-600'>
                    Needs refinement
                  </Text>
                  <Heading level='h3' className='text-lg'>
                    Raw backlog
                  </Heading>
                  <Text variant='small' className='text-text-muted'>
                    Capture ideas, then groom into the refined queue.
                  </Text>
                </Stack>
                <Tag variant='neutral' className='bg-white'>
                  {backlogStories.length} ideas
                </Tag>
              </Stack>
              {renderStoryList(
                backlogStories,
                'No backlog ideas captured yet.'
              )}
            </div>
          </Card>
        </Stack>

        <Stack gap={8}>
          <Card className='border-stone-200 bg-gradient-to-br from-stone-50/50 via-white to-white'>
            <div className='p-5'>
              <Heading level='h4' className='mb-3'>
                Quick add story
              </Heading>
              {project.epics.length === 0 ? (
                <Text variant='small' className='text-text-muted'>
                  Create an epic first to attach new work.
                </Text>
              ) : (
                <form onSubmit={handleStorySubmit}>
                  <Stack gap={4}>
                    <Stack gap={1}>
                      <label className='text-sm font-medium text-text-primary'>
                        Epic
                      </label>
                      <select
                        className='flex h-10 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-text-primary'
                        value={storyDraft.epicId}
                        onChange={(e) =>
                          setStoryDraft((prev) => ({
                            ...prev,
                            epicId: e.target.value,
                          }))
                        }
                      >
                        <option value=''>Select an epic</option>
                        {project.epics.map((epic: Epic) => (
                          <option key={epic.id} value={epic.id}>
                            {epic.name}
                          </option>
                        ))}
                      </select>
                    </Stack>

                    <Stack gap={1}>
                      <label className='text-sm font-medium text-text-primary'>
                        Title
                      </label>
                      <Input
                        value={storyDraft.title}
                        onChange={(e) =>
                          setStoryDraft((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        placeholder='Story title'
                      />
                    </Stack>

                    <Stack gap={1}>
                      <label className='text-sm font-medium text-text-primary'>
                        Acceptance criteria
                      </label>
                      <textarea
                        rows={3}
                        className='flex min-h-[80px] w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary'
                        value={storyDraft.acceptanceCriteria}
                        onChange={(e) =>
                          setStoryDraft((prev) => ({
                            ...prev,
                            acceptanceCriteria: e.target.value,
                          }))
                        }
                        placeholder='One criteria per line'
                      />
                    </Stack>

                    <Button
                      type='submit'
                      disabled={
                        savingStory ||
                        !storyDraft.epicId ||
                        !storyDraft.title.trim()
                      }
                      className='w-full'
                    >
                      {savingStory ? 'Adding…' : 'Add to backlog'}
                    </Button>
                  </Stack>
                </form>
              )}
            </div>
          </Card>

          <Card className='border-stone-200 bg-gradient-to-br from-stone-50/50 via-white to-white'>
            <div className='p-5'>
              <Stack
                direction='row'
                justify='between'
                align='start'
                className='mb-4'
              >
                <Stack gap={1}>
                  <Text variant='eyebrow' className='text-stone-600'>
                    Completed stories
                  </Text>
                  <Heading level='h4'>Recently shipped</Heading>
                  <Text variant='caption' className='text-text-muted'>
                    Undo mistakes or review what cleared in the last few
                    sprints.
                  </Text>
                </Stack>
                <Tag variant='success' className='bg-white'>
                  {completedStories.length}
                </Tag>
              </Stack>

              <Stack gap={2}>
                {recentCompletedStories.length === 0 ? (
                  <div className='rounded-lg border border-dashed border-stone-200/70 bg-white/70 px-3 py-2 text-xs text-stone-700 text-center'>
                    Nothing has been marked done yet.
                  </div>
                ) : (
                  recentCompletedStories.map((story) => {
                    const epic = project.epics.find(
                      (e: Epic) => e.id === story.epicId
                    );
                    const sprint = story.sprintId
                      ? sprintLookup.get(story.sprintId)
                      : null;
                    return (
                      <Card
                        key={story.id}
                        className='p-3 border-stone-100 bg-white/90'
                      >
                        <Stack gap={2}>
                          <Stack
                            direction='row'
                            justify='between'
                            align='start'
                          >
                            <Stack gap={1}>
                              <Text
                                weight='medium'
                                className='text-text-primary'
                              >
                                {story.title}
                              </Text>
                              <Text
                                variant='caption'
                                className='text-text-muted'
                              >
                                {epic ? epic.name : 'Untitled epic'}
                                {sprint
                                  ? ` • ${sprint.name}`
                                  : ' • Unscheduled'}
                              </Text>
                            </Stack>
                            <Tag variant='success'>Done</Tag>
                          </Stack>

                          <Stack
                            direction='row'
                            justify='between'
                            align='center'
                          >
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => openStoryModal(story)}
                              className='h-7 text-xs'
                            >
                              View details
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleReopenStory(story.id)}
                              disabled={reopeningStoryId === story.id}
                              className='h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50'
                            >
                              <RotateCcw className='w-3 h-3 mr-1' />
                              {reopeningStoryId === story.id
                                ? 'Reopening…'
                                : 'Reopen'}
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    );
                  })
                )}
              </Stack>

              <Text variant='caption' className='mt-3 text-text-muted'>
                Shows the ten most recent completions. Older work stays archived
                with its epic.
              </Text>
            </div>
          </Card>
        </Stack>
      </div>

      <Modal
        open={storyModalOpen}
        onClose={closeStoryModal}
        title={editingStory ? 'Edit story' : 'Create story'}
        actions={
          <div className='flex w-full justify-end gap-2'>
            <Button
              variant='outline'
              onClick={closeStoryModal}
              disabled={savingStory}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='story-modal-form'
              disabled={
                savingStory || !storyDraft.epicId || !storyDraft.title.trim()
              }
            >
              {savingStory
                ? 'Saving…'
                : editingStory
                ? 'Save changes'
                : 'Create story'}
            </Button>
          </div>
        }
      >
        <form
          id='story-modal-form'
          className='space-y-4'
          onSubmit={handleStorySubmit}
        >
          <Stack gap={4}>
            <Stack gap={1}>
              <label className='text-sm font-medium text-text-primary'>
                Epic
              </label>
              <select
                className='flex h-10 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-text-primary'
                value={storyDraft.epicId}
                onChange={(e) =>
                  setStoryDraft((prev) => ({
                    ...prev,
                    epicId: e.target.value,
                  }))
                }
              >
                <option value=''>Select an epic</option>
                {project.epics.map((epic: Epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.name}
                  </option>
                ))}
              </select>
            </Stack>

            <Stack gap={1}>
              <label className='text-sm font-medium text-text-primary'>
                Title
              </label>
              <Input
                value={storyDraft.title}
                onChange={(e) =>
                  setStoryDraft((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </Stack>

            <Stack gap={1}>
              <label className='text-sm font-medium text-text-primary'>
                Description
              </label>
              <textarea
                rows={4}
                className='flex min-h-[80px] w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary'
                value={storyDraft.description}
                onChange={(e) =>
                  setStoryDraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </Stack>

            <Stack gap={1}>
              <label className='text-sm font-medium text-text-primary'>
                Acceptance criteria (one per line)
              </label>
              <textarea
                rows={4}
                className='flex min-h-[80px] w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary'
                value={storyDraft.acceptanceCriteria}
                onChange={(e) =>
                  setStoryDraft((prev) => ({
                    ...prev,
                    acceptanceCriteria: e.target.value,
                  }))
                }
              />
            </Stack>

            <div className='grid gap-4 md:grid-cols-2'>
              <Stack gap={1}>
                <label className='text-sm font-medium text-text-primary'>
                  Points
                </label>
                <Input
                  type='number'
                  min='0'
                  value={storyDraft.points}
                  onChange={(e) =>
                    setStoryDraft((prev) => ({
                      ...prev,
                      points: e.target.value,
                    }))
                  }
                />
              </Stack>

              <Stack gap={1}>
                <label className='text-sm font-medium text-text-primary'>
                  Stage
                </label>
                <select
                  className='flex h-10 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-text-primary'
                  value={storyDraft.stage}
                  onChange={(e) =>
                    setStoryDraft((prev) => ({
                      ...prev,
                      stage: e.target.value as StoryStage,
                    }))
                  }
                >
                  {backlogStageOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Stack>
            </div>

            <Stack gap={1}>
              <label className='text-sm font-medium text-text-primary'>
                Sprint (optional)
              </label>
              <select
                className='flex h-10 w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-text-primary'
                value={storyDraft.sprintId}
                onChange={(e) =>
                  setStoryDraft((prev) => ({
                    ...prev,
                    sprintId: e.target.value,
                  }))
                }
              >
                <option value=''>Unassigned</option>
                {project.sprints.map((sprint: Sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </Stack>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
