import { useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Story, StoryStage } from '../../../types/domain';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';

const stageBadge: Record<StoryStage, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  READY: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  IN_REVIEW: 'bg-indigo-100 text-indigo-800',
  DONE: 'bg-emerald-100 text-emerald-800',
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
      setError(
        err instanceof Error ? err.message : 'Could not update story.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const renderStoryList = (stories: Story[], emptyLabel: string) => {
    if (stories.length === 0) {
      return (
        <p className='rounded-md border border-dashed border-slate-300 bg-white/60 px-3 py-2 text-sm text-slate-500'>
          {emptyLabel}
        </p>
      );
    }

    return (
      <ul className='space-y-2'>
        {stories.map((story) => {
          const epic = project.epics.find((e) => e.id === story.epicId);
          return (
            <li key={story.id}>
              <button
                type='button'
                onClick={() => openStoryModal(story)}
                className='w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm shadow-sm transition hover:border-sky-500 hover:shadow'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='space-y-1'>
                    <p className='font-semibold text-slate-900'>
                      {story.title}
                    </p>
                    <p className='text-xs text-slate-500'>
                      {epic ? epic.name : 'Untitled epic'} •{' '}
                      {story.acceptanceCriteria.length} checks
                    </p>
                    <p className='text-xs text-slate-500 line-clamp-2'>
                      {story.description || 'Description not captured yet.'}
                    </p>
                  </div>
                    <div className='text-right space-y-1'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        stageBadge[story.stage]
                      }`}
                    >
                      {story.stage === 'READY' ? 'Refined' : 'Needs refinement'}
                    </span>
                    <div className='mt-2 text-xs font-semibold text-slate-900'>
                      {story.points ? `${story.points} pts` : 'Unestimated'}
                    </div>
                    {story.stage === 'BACKLOG' && (
                      <button
                        type='button'
                        onClick={() => handleMarkReady(story)}
                        className='mt-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 disabled:opacity-50'
                        disabled={updating}
                      >
                        Mark ready
                      </button>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold text-slate-900'>Backlog</h1>
        </div>
        {error && (
          <p className='text-xs text-rose-600'>{error}</p>
        )}
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]'>
        <div className='space-y-6'>
          <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <header className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-amber-600'>
                  Refined backlog
                </p>
                <h2 className='text-lg font-semibold text-slate-900'>
                  Ready for the next sprint
                </h2>
              </div>
              <span className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600'>
                {refinedStories.length} items
              </span>
            </header>
            <div className='mt-4'>
              {renderStoryList(refinedStories, 'Nothing refined yet.')}
            </div>
          </section>

          <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <header className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Needs refinement
                </p>
                <h2 className='text-lg font-semibold text-slate-900'>
                  Raw backlog
                </h2>
              </div>
              <span className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600'>
                {backlogStories.length} ideas
              </span>
            </header>
            <div className='mt-4'>
              {renderStoryList(
                backlogStories,
                'No backlog ideas captured yet.'
              )}
            </div>
          </section>
        </div>

        <aside className='space-y-4'>
          <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
            <h3 className='text-base font-semibold text-slate-900'>
              How we work stories
            </h3>
          </section>
        </aside>
      </div>

      <Modal
        open={storyModalOpen}
        onClose={closeStoryModal}
        title='Story details'
      >
        {selectedStory && (
          <div className='space-y-3 text-sm text-slate-700'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Title
              </p>
              <p className='text-base font-semibold text-slate-900'>
                {selectedStory.title}
              </p>
            </div>
            {selectedStory.description && (
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Description
                </p>
                <p className='text-sm text-slate-700'>
                  {selectedStory.description}
                </p>
              </div>
            )}
            {selectedStory.acceptanceCriteria.length > 0 && (
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Acceptance criteria
                </p>
                <ul className='mt-1 list-disc space-y-1 pl-5'>
                  {selectedStory.acceptanceCriteria.map((criteria) => (
                    <li key={criteria}>{criteria}</li>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
