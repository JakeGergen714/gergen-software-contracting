import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useServices } from '../../../context/ServiceContext';
import { Story, StoryStage } from '../../../types/domain';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useDomainModal } from '../../../components/domain/DomainModalProvider';

const backlogStageOptions: { key: StoryStage; label: string }[] = [
  { key: 'BACKLOG', label: 'Needs refinement' },
  { key: 'READY', label: 'Refined' },
];

const defaultStoryDraft = (epicId?: string) => ({
  epicId: epicId ?? '',
  title: '',
  description: '',
  acceptanceCriteria: '',
  points: '',
  stage: 'BACKLOG' as StoryStage,
  sprintId: '',
});

const stageBadge: Record<StoryStage, string> = {
  BACKLOG: 'bg-slate-100 text-slate-600',
  READY: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  IN_REVIEW: 'bg-indigo-100 text-indigo-800',
  DONE: 'bg-emerald-100 text-emerald-800',
};

export default function AdminProjectBacklog() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();
  const { openStory } = useDomainModal();

  const [storyDraft, setStoryDraft] = useState(() =>
    defaultStoryDraft(project.epics[0]?.id)
  );
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [savingStory, setSavingStory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [reopeningStoryId, setReopeningStoryId] = useState<string | null>(null);

  const refinedStories = useMemo(
    () => project.stories.filter((story) => story.stage === 'READY'),
    [project.stories]
  );

  const backlogStories = useMemo(
    () => project.stories.filter((story) => story.stage === 'BACKLOG'),
    [project.stories]
  );

  const sprintLookup = useMemo(
    () => new Map(project.sprints.map((sprint) => [sprint.id, sprint])),
    [project.sprints]
  );

  const completedStories = useMemo(
    () => project.stories.filter((story) => story.stage === 'DONE'),
    [project.stories]
  );

  const recentCompletedStories = useMemo(() => {
    return [...completedStories]
      .sort((a, b) => {
        const sprintA = a.sprintId ? sprintLookup.get(a.sprintId) : null;
        const sprintB = b.sprintId ? sprintLookup.get(b.sprintId) : null;
        const dateA = sprintA ? new Date(sprintA.endAt).getTime() : 0;
        const dateB = sprintB ? new Date(sprintB.endAt).getTime() : 0;
        if (dateA === dateB) {
          return a.title.localeCompare(b.title);
        }
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [completedStories, sprintLookup]);

  useEffect(() => {
    if (!storyDraft.epicId && project.epics[0]) {
      setStoryDraft((prev) => ({ ...prev, epicId: project.epics[0].id }));
    }
  }, [project.epics, storyDraft.epicId]);

  const closeStoryModal = () => {
    setStoryModalOpen(false);
    setEditingStory(null);
    setStoryDraft(defaultStoryDraft(project.epics[0]?.id));
  };

  const openStoryModal = (story?: Story) => {
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
              <div className='w-full rounded-2xl border border-slate-200/70 bg-white/95 p-3 text-left text-sm shadow-[0_12px_35px_rgba(15,23,42,0.08)]'>
                <div className='flex items-start justify-between gap-3'>
                  <button
                    type='button'
                    onClick={() => openStoryModal(story)}
                    className='flex-1 text-left'
                  >
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <p className='font-semibold text-slate-900'>
                          {story.title}
                        </p>
                        <button
                          type='button'
                          className='text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700'
                          onClick={(event) => {
                            event.stopPropagation();
                            openStory(story.id);
                          }}
                        >
                          Modal
                        </button>
                      </div>
                      <p className='text-xs text-slate-500'>
                        {epic ? epic.name : 'Untitled epic'} •{' '}
                        {story.acceptanceCriteria.length} checks
                      </p>
                      <p className='text-xs text-slate-500 line-clamp-2'>
                        {story.description || 'Description not captured yet.'}
                      </p>
                    </div>
                  </button>
                  <div className='flex flex-col items-end gap-1 text-right'>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        stageBadge[story.stage]
                      }`}
                    >
                      {backlogStageOptions.find(
                        (opt) => opt.key === story.stage
                      )?.label ?? story.stage}
                    </span>
                    <div className='mt-1 text-xs font-semibold text-slate-900'>
                      {story.points ? `${story.points} pts` : 'Unestimated'}
                    </div>
                    <select
                      value={story.stage}
                      onChange={(e) =>
                        handleUpdateStoryStage(
                          story.id,
                          e.target.value as StoryStage
                        )
                      }
                      className='mt-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600'
                    >
                      {backlogStageOptions.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type='button'
                      onClick={() => handleDeleteStory(story.id)}
                      className='mt-2 rounded-md border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700 disabled:opacity-50'
                      disabled={deletingStoryId === story.id}
                    >
                      {deletingStoryId === story.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className='space-y-4'>
      {error && (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
          {error}
        </div>
      )}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            Backlog management
          </p>
          <h1 className='text-xl font-semibold text-slate-900'>
            Backlog control center
          </h1>
        </div>
        <button
          type='button'
          onClick={() => openStoryModal()}
          className='rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg hover:from-violet-600 hover:to-indigo-600'
        >
          Create story
        </button>
      </div>

      <div className='grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]'>
        <div className='space-y-6'>
          <section className='rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-[0_20px_60px_rgba(16,185,129,0.2)]'>
            <header className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-amber-600'>
                  Refined backlog
                </p>
                <h2 className='text-lg font-semibold text-slate-900'>
                  Ready for the next sprint
                </h2>
                <p className='text-xs text-slate-500'>
                  Estimated stories with clear acceptance criteria.
                </p>
              </div>
              <span className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600'>
                {refinedStories.length} items
              </span>
            </header>
            <div className='mt-4'>
              {renderStoryList(refinedStories, 'Nothing refined yet.')}
            </div>
          </section>

          <section className='rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-[0_20px_60px_rgba(245,158,11,0.25)]'>
            <header className='flex items-center justify-between'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                  Needs refinement
                </p>
                <h2 className='text-lg font-semibold text-slate-900'>
                  Raw backlog
                </h2>
                <p className='text-xs text-slate-500'>
                  Capture ideas, then groom into the refined queue.
                </p>
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
          <section className='rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-5 shadow-[0_20px_60px_rgba(99,102,241,0.25)]'>
            <h3 className='text-base font-semibold text-slate-900'>
              Quick add story
            </h3>
            {project.epics.length === 0 ? (
              <p className='mt-2 text-sm text-slate-500'>
                Create an epic first to attach new work.
              </p>
            ) : (
              <form
                className='mt-3 space-y-3 text-sm'
                onSubmit={handleStorySubmit}
              >
                <label className='flex flex-col gap-1 text-slate-600'>
                  Epic
                  <select
                    className='rounded-md border border-slate-300 px-2 py-1'
                    value={storyDraft.epicId}
                    onChange={(e) =>
                      setStoryDraft((prev) => ({
                        ...prev,
                        epicId: e.target.value,
                      }))
                    }
                  >
                    <option value=''>Select an epic</option>
                    {project.epics.map((epic) => (
                      <option key={epic.id} value={epic.id}>
                        {epic.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className='flex flex-col gap-1 text-slate-600'>
                  Title
                  <input
                    className='rounded-md border border-slate-300 px-2 py-1'
                    value={storyDraft.title}
                    onChange={(e) =>
                      setStoryDraft((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className='flex flex-col gap-1 text-slate-600'>
                  Acceptance criteria (one per line)
                  <textarea
                    rows={3}
                    className='rounded-md border border-slate-300 px-2 py-1'
                    value={storyDraft.acceptanceCriteria}
                    onChange={(e) =>
                      setStoryDraft((prev) => ({
                        ...prev,
                        acceptanceCriteria: e.target.value,
                      }))
                    }
                  />
                </label>
                <button
                  type='submit'
                  disabled={
                    savingStory ||
                    !storyDraft.epicId ||
                    !storyDraft.title.trim()
                  }
                  className='w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white disabled:opacity-50'
                >
                  {savingStory ? 'Adding…' : 'Add to backlog'}
                </button>
              </form>
            )}
          </section>

          <section className='rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-[0_20px_60px_rgba(16,185,129,0.2)]'>
            <header className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-emerald-600'>
                  Completed stories
                </p>
                <h3 className='text-base font-semibold text-slate-900'>
                  Recently shipped
                </h3>
                <p className='text-xs text-slate-500'>
                  Undo mistakes or review what cleared in the last few sprints.
                </p>
              </div>
              <span className='rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700'>
                {completedStories.length}
              </span>
            </header>
            <div className='mt-4 space-y-2'>
              {recentCompletedStories.length === 0 ? (
                <p className='rounded-lg border border-dashed border-emerald-200/70 bg-white/70 px-3 py-2 text-xs text-emerald-700'>
                  Nothing has been marked done yet.
                </p>
              ) : (
                <ul className='space-y-2'>
                  {recentCompletedStories.map((story) => {
                    const epic = project.epics.find(
                      (e) => e.id === story.epicId
                    );
                    const sprint = story.sprintId
                      ? sprintLookup.get(story.sprintId)
                      : null;
                    return (
                      <li key={story.id}>
                        <div className='rounded-2xl border border-emerald-100 bg-white/90 px-3 py-3 text-sm text-slate-700 shadow-[0_15px_30px_rgba(16,185,129,0.15)]'>
                          <div className='flex items-start justify-between gap-2'>
                            <div>
                              <p className='font-semibold text-slate-900'>
                                {story.title}
                              </p>
                              <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                                {epic ? epic.name : 'Untitled epic'}
                                {sprint
                                  ? ` • ${sprint.name}`
                                  : ' • Unscheduled'}
                              </p>
                            </div>
                            <span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700'>
                              Done
                            </span>
                          </div>
                          <div className='mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold'>
                            <button
                              type='button'
                              onClick={() => openStoryModal(story)}
                              className='rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:border-slate-300'
                            >
                              View details
                            </button>
                            <button
                              type='button'
                              onClick={() => handleReopenStory(story.id)}
                              className='rounded-full border border-amber-200 px-3 py-1 text-[11px] font-semibold text-amber-800 hover:border-amber-300 disabled:opacity-50'
                              disabled={reopeningStoryId === story.id}
                            >
                              {reopeningStoryId === story.id
                                ? 'Reopening…'
                                : 'Reopen to READY'}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <p className='mt-3 text-[11px] text-slate-500'>
              Shows the ten most recent completions. Older work stays archived
              with its epic.
            </p>
          </section>
        </aside>
      </div>

      <Modal
        title={editingStory ? 'Edit story' : 'Create story'}
        open={storyModalOpen}
        onClose={closeStoryModal}
        actions={
          <div className='flex w-full justify-end gap-2'>
            <button
              type='button'
              className='rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700'
              onClick={closeStoryModal}
              disabled={savingStory}
            >
              Cancel
            </button>
            <button
              type='submit'
              form='story-modal-form'
              disabled={
                savingStory || !storyDraft.epicId || !storyDraft.title.trim()
              }
              className='rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50'
            >
              {savingStory
                ? 'Saving…'
                : editingStory
                ? 'Save changes'
                : 'Create story'}
            </button>
          </div>
        }
      >
        <form
          id='story-modal-form'
          className='space-y-4'
          onSubmit={handleStorySubmit}
        >
          <label className='flex flex-col gap-1 text-sm text-slate-600'>
            Epic
            <select
              className='rounded-md border border-slate-300 px-2 py-1'
              value={storyDraft.epicId}
              onChange={(e) =>
                setStoryDraft((prev) => ({
                  ...prev,
                  epicId: e.target.value,
                }))
              }
            >
              <option value=''>Select an epic</option>
              {project.epics.map((epic) => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </label>
          <label className='flex flex-col gap-1 text-sm text-slate-600'>
            Title
            <input
              className='rounded-md border border-slate-300 px-2 py-1'
              value={storyDraft.title}
              onChange={(e) =>
                setStoryDraft((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />
          </label>
          <label className='flex flex-col gap-1 text-sm text-slate-600'>
            Description
            <textarea
              rows={4}
              className='rounded-md border border-slate-300 px-2 py-1'
              value={storyDraft.description}
              onChange={(e) =>
                setStoryDraft((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </label>
          <label className='flex flex-col gap-1 text-sm text-slate-600'>
            Acceptance criteria (one per line)
            <textarea
              rows={4}
              className='rounded-md border border-slate-300 px-2 py-1'
              value={storyDraft.acceptanceCriteria}
              onChange={(e) =>
                setStoryDraft((prev) => ({
                  ...prev,
                  acceptanceCriteria: e.target.value,
                }))
              }
            />
          </label>
          <div className='grid gap-4 md:grid-cols-2'>
            <label className='flex flex-col gap-1 text-sm text-slate-600'>
              Points
              <input
                type='number'
                min='0'
                className='rounded-md border border-slate-300 px-2 py-1'
                value={storyDraft.points}
                onChange={(e) =>
                  setStoryDraft((prev) => ({
                    ...prev,
                    points: e.target.value,
                  }))
                }
              />
            </label>
            <label className='flex flex-col gap-1 text-sm text-slate-600'>
              Stage
              <select
                className='rounded-md border border-slate-300 px-2 py-1'
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
            </label>
          </div>
          <label className='flex flex-col gap-1 text-sm text-slate-600'>
            Sprint (optional)
            <select
              className='rounded-md border border-slate-300 px-2 py-1'
              value={storyDraft.sprintId}
              onChange={(e) =>
                setStoryDraft((prev) => ({
                  ...prev,
                  sprintId: e.target.value,
                }))
              }
            >
              <option value=''>Unassigned</option>
              {project.sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Modal>
    </div>
  );
}
