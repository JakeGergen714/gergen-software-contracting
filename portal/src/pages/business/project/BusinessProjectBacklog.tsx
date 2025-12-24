import { useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Story, StoryStage } from '../../../types/domain';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';
import { Card } from '../../../components/ui/card';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Tag } from '../../../components/ui/tag';

const stageBadge: Record<
  StoryStage,
  'neutral' | 'warning' | 'soft' | 'success' | 'outline'
> = {
  BACKLOG: 'neutral',
  READY: 'warning',
  IN_PROGRESS: 'soft',
  IN_REVIEW: 'soft',
  DONE: 'success',
};

export default function BusinessProjectBacklog() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();

  const refinedStories = useMemo(
    () => project.stories.filter((story) => story.stage === 'READY'),
    [project.stories]
  );

  const backlogStories = useMemo(
    () => project.stories.filter((story) => story.stage === 'BACKLOG'),
    [project.stories]
  );

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openStoryModal = (story: Story) => {
    setSelectedStory(story);
    setStoryModalOpen(true);
  };

  const closeStoryModal = () => {
    setStoryModalOpen(false);
    setSelectedStory(null);
  };

  const handleMarkReady = async (story: Story) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points ?? 1,
        sprintId: story.sprintId ?? null,
        stage: 'READY',
      });
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update story.');
    } finally {
      setUpdating(false);
    }
  };

  const renderStoryList = (stories: Story[], emptyLabel: string) => {
    if (stories.length === 0) {
      return (
        <div className='rounded-md border border-dashed border-slate-300 bg-white/60 px-3 py-2'>
          <Text variant='small' className='text-slate-500'>
            {emptyLabel}
          </Text>
        </div>
      );
    }

    return (
      <Stack gap={2}>
        {stories.map((story) => {
          const epic = project.epics.find((e) => e.id === story.epicId);
          return (
            <div key={story.id}>
              <button
                type='button'
                onClick={() => openStoryModal(story)}
                className='w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm shadow-sm transition hover:border-sky-500 hover:shadow'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <Text weight='semibold' className='text-slate-900'>
                      {story.title}
                    </Text>
                    <Text variant='caption' className='text-slate-500'>
                      {epic ? epic.name : 'Untitled epic'} •{' '}
                      {story.acceptanceCriteria.length} checks
                    </Text>
                    <Text
                      variant='caption'
                      className='text-slate-500 line-clamp-2'
                    >
                      {story.description || 'Description not captured yet.'}
                    </Text>
                  </div>
                  <div className='text-right space-y-1 flex flex-col items-end'>
                    <Tag variant={stageBadge[story.stage]}>
                      {story.stage === 'READY' ? 'Refined' : 'Needs refinement'}
                    </Tag>
                    <Text
                      variant='caption'
                      weight='semibold'
                      className='mt-2 text-slate-900'
                    >
                      {story.points ? `${story.points} pts` : 'Unestimated'}
                    </Text>
                    {story.stage === 'BACKLOG' && (
                      <Button
                        variant='outline'
                        size='sm'
                        className='mt-1 h-6 text-[11px] px-2'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkReady(story);
                        }}
                        disabled={updating}
                      >
                        Mark ready
                      </Button>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </Stack>
    );
  };

  return (
    <Stack gap={4}>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <Heading level='h1'>Backlog</Heading>
        </div>
        {error && (
          <Text variant='caption' className='text-rose-600'>
            {error}
          </Text>
        )}
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]'>
        <Stack gap={6}>
          <Card>
            <Stack gap={4}>
              <header className='flex items-center justify-between'>
                <div>
                  <Text variant='eyebrow' className='text-amber-600'>
                    Refined backlog
                  </Text>
                  <Heading level='h2' className='text-lg'>
                    Ready for the next sprint
                  </Heading>
                </div>
                <Tag variant='outline'>{refinedStories.length} items</Tag>
              </header>
              <div>
                {renderStoryList(refinedStories, 'Nothing refined yet.')}
              </div>
            </Stack>
          </Card>

          <Card>
            <Stack gap={4}>
              <header className='flex items-center justify-between'>
                <div>
                  <Text variant='eyebrow'>Needs refinement</Text>
                  <Heading level='h2' className='text-lg'>
                    Raw backlog
                  </Heading>
                </div>
                <Tag variant='outline'>{backlogStories.length} ideas</Tag>
              </header>
              <div>
                {renderStoryList(
                  backlogStories,
                  'No backlog ideas captured yet.'
                )}
              </div>
            </Stack>
          </Card>
        </Stack>

        <aside className='space-y-4'>
          <Card>
            <Heading level='h3' className='text-base'>
              How we work stories
            </Heading>
          </Card>
        </aside>
      </div>

      <Modal
        open={storyModalOpen}
        onClose={closeStoryModal}
        title='Story details'
      >
        {selectedStory && (
          <Stack gap={3}>
            <div>
              <Text variant='eyebrow'>Title</Text>
              <Text weight='semibold' className='text-lg text-slate-900'>
                {selectedStory.title}
              </Text>
            </div>
            {selectedStory.description && (
              <div>
                <Text variant='eyebrow'>Description</Text>
                <Text variant='body' className='text-slate-700'>
                  {selectedStory.description}
                </Text>
              </div>
            )}
            {selectedStory.acceptanceCriteria.length > 0 && (
              <div>
                <Text variant='eyebrow'>Acceptance criteria</Text>
                <ul className='mt-1 list-disc space-y-1 pl-5'>
                  {selectedStory.acceptanceCriteria.map((criteria) => (
                    <li key={criteria}>
                      <Text variant='body'>{criteria}</Text>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className='flex flex-wrap gap-4 text-xs text-slate-500'>
              <span className='font-semibold text-slate-900'>Stage:</span>
              {selectedStory.stage === 'READY' ? 'Refined' : 'Needs refinement'}
              {selectedStory.points && (
                <span className='font-semibold text-slate-900'>
                  Points: {selectedStory.points}
                </span>
              )}
            </div>
          </Stack>
        )}
      </Modal>
    </Stack>
  );
}
