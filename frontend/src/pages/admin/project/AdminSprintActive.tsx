import { useMemo, useState } from 'react';
import { SprintBoard } from '../../../components/admin/SprintBoard';
import { useServices } from '../../../context/ServiceContext';
import { StoryStage } from '../../../types/domain';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useDomainModal } from '../../../components/domain/DomainModalProvider';
import { FaDownload } from 'react-icons/fa';

export default function AdminSprintActive() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService, reports } = useServices();
  const { openSprint, openStory } = useDomainModal();
  const activeSprint = project.sprints.find(
    (sprint) => sprint.status === 'ACTIVE'
  );
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sprintStories = useMemo(
    () =>
      project.stories.filter((story) =>
        activeSprint
          ? story.sprintId === activeSprint.id
          : story.stage !== 'BACKLOG'
      ),
    [project.stories, activeSprint]
  );

  const doneStories = sprintStories.filter((story) => story.stage === 'DONE');
  const remainingStories = sprintStories.length - doneStories.length;
  const blockers = sprintStories.filter((story) => story.stage === 'IN_REVIEW');
  const [moveUnfinishedToNext, setMoveUnfinishedToNext] = useState(true);

  const handleUpdateStage = async (storyId: string, stage: StoryStage) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await projectService.updateStoryStage(
        project.id,
        storyId,
        stage
      );
      setProject(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update story status.'
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleEndSprint = async () => {
    if (!activeSprint) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await projectService.endSprint(
        project.id,
        activeSprint.id,
        {
          moveUnfinishedToNextSprint: moveUnfinishedToNext,
        }
      );
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not end sprint.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = async () => {
    if (!activeSprint) return;
    setExporting(true);
    try {
      await reports.downloadSprintCsv(project.id, activeSprint.id);
    } catch (error) {
      console.error('Failed to export sprint:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!activeSprint) {
    return (
      <div className='rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500'>
        No active sprint. Kick one off from the Planning tab to start tracking.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {error && (
        <div className='rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700'>
          {error}
        </div>
      )}
      <section className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'>
        <div className='flex flex-wrap items-center gap-4 text-sm text-slate-600'>
          <div>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
              Burn-down
            </p>
            <p className='text-lg font-semibold text-slate-900'>
              {doneStories.length} done · {remainingStories} remaining
            </p>
            <p className='text-xs text-slate-500'>
              {new Date(activeSprint.startAt).toLocaleDateString()} –{' '}
              {new Date(activeSprint.endAt).toLocaleDateString()} • Goal:{' '}
              {activeSprint.goal || 'Unset'}
            </p>
          </div>
          <button
            type='button'
            className='ml-auto text-[11px] font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700'
            onClick={() => openSprint(activeSprint.id)}
          >
            Open sprint modal
          </button>
          {updating && (
            <div className='ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500'>
              Syncing…
            </div>
          )}
        </div>
      </section>

      <section className='rounded-3xl border border-slate-100 bg-white p-5 shadow-sm'>
        <div className='flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600'>
          <h3 className='text-base font-semibold text-slate-900'>
            Sprint board
          </h3>
          <div className='flex flex-wrap items-center gap-3'>
            <button
              onClick={handleExport}
              disabled={exporting}
              className='flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50'
            >
              <FaDownload size={12} />
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <label className='flex items-center gap-2 text-[11px] uppercase tracking-wide'>
              <input
                type='checkbox'
                className='h-3 w-3 rounded border-slate-300'
                checked={moveUnfinishedToNext}
                onChange={(e) => setMoveUnfinishedToNext(e.target.checked)}
              />
              Move unfinished to next sprint
            </label>
            <button
              type='button'
              onClick={handleEndSprint}
              className='rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50'
              disabled={updating}
            >
              End sprint
            </button>
          </div>
        </div>
        <div className='mt-4'>
          <SprintBoard
            stories={sprintStories}
            epics={project.epics}
            onUpdateStage={handleUpdateStage}
          />
        </div>
      </section>

      <section className='rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-[0_15px_45px_rgba(245,158,11,0.25)]'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-amber-800'>
          Blockers
        </p>
        {blockers.length > 0 ? (
          <ul className='mt-3 space-y-2 text-sm text-amber-900'>
            {blockers.map((story) => (
              <li
                key={story.id}
                className='flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3 py-2 text-amber-900'
              >
                <button
                  type='button'
                  className='font-semibold text-left hover:underline'
                  onClick={() => openStory(story.id)}
                >
                  {story.title}
                </button>
                <span className='text-xs uppercase tracking-wide'>
                  Waiting on review
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mt-2 text-sm text-amber-900'>
            No blockers flagged. Keep monitoring QA and release checklists.
          </p>
        )}
      </section>
    </div>
  );
}
