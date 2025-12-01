import { FormEvent, useMemo, useState, useEffect } from 'react';
import { StatusNoteHistory } from '../../../components/project/StatusNoteHistory';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import {
  EpicStatus,
  Story,
  StoryStage,
  StatusNoteVersion,
} from '../../../types/domain';
import { useServices } from '../../../context/ServiceContext';

const attentionStatuses: EpicStatus[] = ['AWAITING_APPROVAL', 'IN_PROGRESS'];

const statusLabel = (status: EpicStatus) =>
  status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export default function AdminProjectOps() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();
  const [history, setHistory] = useState<StatusNoteVersion[]>([]);

  useEffect(() => {
    projectService
      .getStatusNoteHistory(project.id)
      .then(setHistory)
      .catch(console.error);
  }, [project.id, projectService]);

  const [statusDraft, setStatusDraft] = useState(project.statusNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [storyActionId, setStoryActionId] = useState<string | null>(null);
  const [epicActionId, setEpicActionId] = useState<string | null>(null);

  const riskItems = useMemo(() => {
    return project.epics
      .filter((epic) => attentionStatuses.includes(epic.status))
      .map((epic) => ({
        id: epic.id,
        name: epic.name,
        status: epic.status,
      }));
  }, [project.epics]);

  const awaitingApprovalEpics = useMemo(
    () => project.epics.filter((epic) => epic.status === 'AWAITING_APPROVAL'),
    [project.epics]
  );

  const supportThreads = useMemo(() => {
    return project.meetings
      .filter((meeting) => meeting.type === 'REVIEW')
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      )
      .slice(0, 5);
  }, [project.meetings]);

  const reviewStories = useMemo(
    () => project.stories.filter((story) => story.stage === 'IN_REVIEW'),
    [project.stories]
  );

  const readyWithoutSprint = useMemo(
    () =>
      project.stories.filter(
        (story) => story.stage === 'READY' && !story.sprintId
      ),
    [project.stories]
  );

  const doneWithoutSprint = useMemo(
    () =>
      project.stories.filter(
        (story) => story.stage === 'DONE' && !story.sprintId
      ),
    [project.stories]
  );

  const activeSprint = useMemo(
    () => project.sprints.find((sprint) => sprint.status === 'ACTIVE'),
    [project.sprints]
  );

  const activeSprintStats = useMemo(() => {
    if (!activeSprint) return null;
    const stories = project.stories.filter(
      (story) => story.sprintId === activeSprint.id
    );
    const done = stories.filter((story) => story.stage === 'DONE').length;
    const review = stories.filter(
      (story) => story.stage === 'IN_REVIEW'
    ).length;
    return {
      total: stories.length,
      done,
      review,
      remaining: stories.length - done,
    };
  }, [activeSprint, project.stories]);

  const assignableSprints = useMemo(
    () => project.sprints.filter((sprint) => sprint.status !== 'COMPLETE'),
    [project.sprints]
  );

  const handleStatusSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || statusDraft.trim() === (project.statusNote ?? '')) {
      return;
    }
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const updated = await projectService.updateStatusNote(
        project.id,
        statusDraft.trim()
      );
      setProject(updated);
      setStatusDraft(updated.statusNote ?? '');
      setSuccess('Status note published.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update status note.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStoryStageChange = async (storyId: string, stage: StoryStage) => {
    setStoryActionId(storyId);
    setError(null);
    setSuccess(null);
    try {
      const updated = await projectService.updateStoryStage(
        project.id,
        storyId,
        stage
      );
      setProject(updated);
      setSuccess('Story status updated.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update story status.'
      );
    } finally {
      setStoryActionId(null);
    }
  };

  const handleAssignStoryToSprint = async (story: Story, sprintId: string) => {
    if (!sprintId) return;
    setStoryActionId(story.id);
    setError(null);
    setSuccess(null);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        sprintId,
        stage: story.stage,
        planningOrder: story.planningOrder ?? null,
      });
      setProject(updated);
      setSuccess('Story assigned to sprint.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not assign story to sprint.'
      );
    } finally {
      setStoryActionId(null);
    }
  };

  const handleApproveEpic = async (epicId: string) => {
    setEpicActionId(epicId);
    setError(null);
    setSuccess(null);
    try {
      const updated = await projectService.updateEpicStatus(
        project.id,
        epicId,
        'APPROVED'
      );
      setProject(updated);
      setSuccess('Epic marked approved.');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not update epic status.'
      );
    } finally {
      setEpicActionId(null);
    }
  };

  return (
    <div className='space-y-6'>
      <section className='rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 p-6 text-white shadow-[0_45px_95px_rgba(15,23,42,0.65)] grid gap-6 md:grid-cols-[1.4fr,0.6fr]'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-white/60'>
            Ops pulse
          </p>
          <h2 className='text-3xl font-semibold tracking-tight mt-2'>
            {project.statusNote?.trim() || 'No active risks logged yet.'}
          </h2>
          <p className='mt-3 text-sm text-white/70 max-w-xl'>
            Keep this headline updated so the client view stays aligned with
            what the delivery team is actually working through.
          </p>
        </div>
        <div className='grid grid-cols-2 gap-3 text-center text-white/80 sm:grid-cols-3'>
          <div className='rounded-2xl border border-white/20 bg-white/10 px-3 py-4 backdrop-blur'>
            <p className='text-3xl font-semibold text-white'>
              {reviewStories.length}
            </p>
            <p className='text-xs uppercase tracking-wide'>Stuck in review</p>
          </div>
          <div className='rounded-2xl border border-white/20 bg-white/10 px-3 py-4 backdrop-blur'>
            <p className='text-3xl font-semibold text-white'>
              {readyWithoutSprint.length}
            </p>
            <p className='text-xs uppercase tracking-wide'>
              Ready w/out sprint
            </p>
          </div>
          <div className='rounded-2xl border border-emerald-200/80 bg-emerald-400/10 px-3 py-4 backdrop-blur sm:col-span-1 col-span-2'>
            <p className='text-3xl font-semibold text-emerald-50'>
              {awaitingApprovalEpics.length}
            </p>
            <p className='text-xs uppercase tracking-wide text-emerald-100'>
              Client approvals
            </p>
          </div>
        </div>
      </section>
      <StatusNoteHistory versions={history} />

      {error && (
        <div className='rounded-3xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 shadow-[0_15px_35px_rgba(244,63,94,0.25)]'>
          {error}
        </div>
      )}
      {success && (
        <div className='rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900 shadow-[0_15px_35px_rgba(16,185,129,0.25)]'>
          {success}
        </div>
      )}

      <section className='rounded-3xl border border-slate-900/10 bg-white p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)] grid gap-6 md:grid-cols-[1.2fr,0.8fr]'>
        <form onSubmit={handleStatusSubmit} className='space-y-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Publish update
            </p>
            <h3 className='text-2xl font-semibold text-slate-900 mt-1'>
              Client-facing status note
            </h3>
            <p className='text-sm text-slate-500 mt-2'>
              Summaries here flow directly onto the client overview card, so
              keep it tight and actionable.
            </p>
          </div>
          <label className='flex flex-col gap-2 text-sm text-slate-600'>
            <span className='font-semibold text-slate-700'>Status text</span>
            <textarea
              rows={5}
              className='w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm shadow-inner focus:border-slate-400 focus:outline-none'
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              placeholder='Example: Invoice workspace ready for UAT; dashboard widgets still in progress.'
            />
          </label>
          <div className='flex flex-wrap items-center gap-3 text-xs text-slate-500'>
            <p>
              Last published:{' '}
              {project.updatedAt
                ? new Date(project.updatedAt).toLocaleString()
                : 'Not tracked yet'}
            </p>
            <div className='ml-auto flex items-center gap-2'>
              <button
                type='button'
                className='rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-500 hover:text-slate-700'
                onClick={() => setStatusDraft(project.statusNote ?? '')}
                disabled={saving}
              >
                Reset
              </button>
              <button
                type='submit'
                className='rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-[0_15px_30px_rgba(15,23,42,0.35)] disabled:opacity-50'
                disabled={
                  saving || statusDraft.trim() === (project.statusNote ?? '')
                }
              >
                {saving ? 'Saving…' : 'Save status note'}
              </button>
            </div>
          </div>
        </form>
        <div className='rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-5 text-sm text-slate-700 shadow-[0_20px_55px_rgba(79,70,229,0.15)]'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500'>
            Playbook
          </p>
          <ul className='mt-4 space-y-3 text-sm'>
            <li className='flex gap-3'>
              <span className='text-indigo-400'>•</span>
              Confirm owners for each open issue before reporting upstream.
            </li>
            <li className='flex gap-3'>
              <span className='text-indigo-400'>•</span>
              Capture risk updates ahead of the weekly review cadence.
            </li>
            <li className='flex gap-3'>
              <span className='text-indigo-400'>•</span>
              Push fixes live on this tab once mitigations are verified.
            </li>
          </ul>
        </div>
      </section>

      <section className='rounded-3xl border border-white/40 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.55)]'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-white/60'>
              Workflow insights
            </p>
            <h3 className='text-2xl font-semibold tracking-tight'>
              {activeSprint
                ? `${activeSprint.name} • ${activeSprintStats?.done ?? 0}/${
                    activeSprintStats?.total ?? 0
                  } done`
                : 'No active sprint'}
            </h3>
            <p className='text-sm text-white/80'>
              {activeSprint
                ? `${
                    activeSprintStats?.remaining ?? 0
                  } stories still in flight, ${
                    activeSprintStats?.review ?? 0
                  } waiting on review.`
                : 'Kick off a sprint from Planning when the team is ready.'}
            </p>
          </div>
          {activeSprint && (
            <div className='rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-right text-sm'>
              <p className='text-xs uppercase tracking-wide text-white/60'>
                Sprint window
              </p>
              <p className='font-semibold text-white'>
                {new Date(activeSprint.startAt).toLocaleDateString()} –{' '}
                {new Date(activeSprint.endAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className='mt-4 grid gap-4 md:grid-cols-3'>
          <article className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70'>
              Review queue
            </p>
            <p className='mt-2 text-3xl font-semibold'>
              {reviewStories.length}
            </p>
            <p className='text-xs text-white/70'>
              Stories waiting on validation
            </p>
          </article>
          <article className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70'>
              Ready, unscheduled
            </p>
            <p className='mt-2 text-3xl font-semibold'>
              {readyWithoutSprint.length}
            </p>
            <p className='text-xs text-white/70'>Need a sprint assignment</p>
          </article>
          <article className='rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur'>
            <p className='text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70'>
              Done, no sprint
            </p>
            <p className='mt-2 text-3xl font-semibold'>
              {doneWithoutSprint.length}
            </p>
            <p className='text-xs text-white/70'>
              Ready to archive with clients
            </p>
          </article>
        </div>
      </section>

      <section className='rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_25px_60px_rgba(15,23,42,0.12)]'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Action queue
            </p>
            <h3 className='text-xl font-semibold text-slate-900'>
              Clear review + schedule ready work
            </h3>
          </div>
        </div>
        <div className='mt-4 grid gap-5 lg:grid-cols-2'>
          <article className='rounded-2xl border border-amber-100/80 bg-amber-50/60 p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-amber-700'>
                  Review queue
                </p>
                <p className='text-sm text-amber-900'>
                  Mark items done or send them back.
                </p>
              </div>
              <span className='rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800'>
                {reviewStories.length}
              </span>
            </div>
            <div className='mt-3 space-y-2'>
              {reviewStories.length === 0 ? (
                <p className='rounded-lg border border-dashed border-amber-200 px-3 py-2 text-xs text-amber-800'>
                  Nothing is waiting on review.
                </p>
              ) : (
                reviewStories.slice(0, 5).map((story) => {
                  const epic = project.epics.find(
                    (ep) => ep.id === story.epicId
                  );
                  return (
                    <div
                      key={story.id}
                      className='rounded-2xl border border-amber-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm'
                    >
                      <p className='font-semibold text-slate-900'>
                        {story.title}
                      </p>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                        {epic ? epic.name : 'Untitled epic'} •{' '}
                        {story.points ?? '—'} pts
                      </p>
                      <div className='mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold'>
                        <button
                          type='button'
                          onClick={() =>
                            handleStoryStageChange(story.id, 'IN_PROGRESS')
                          }
                          className='rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:border-slate-300 disabled:opacity-50'
                          disabled={storyActionId === story.id}
                        >
                          Needs work
                        </button>
                        <button
                          type='button'
                          onClick={() =>
                            handleStoryStageChange(story.id, 'DONE')
                          }
                          className='rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:border-emerald-300 disabled:opacity-50'
                          disabled={storyActionId === story.id}
                        >
                          {storyActionId === story.id
                            ? 'Updating…'
                            : 'Mark done'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>
          <article className='rounded-2xl border border-sky-100/80 bg-sky-50/60 p-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-sky-700'>
                  Ready without sprint
                </p>
                <p className='text-sm text-sky-900'>
                  Assign work to a planned or active sprint.
                </p>
              </div>
              <span className='rounded-full border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-800'>
                {readyWithoutSprint.length}
              </span>
            </div>
            {assignableSprints.length === 0 &&
              readyWithoutSprint.length > 0 && (
                <p className='mt-3 rounded-lg border border-dashed border-sky-200 px-3 py-2 text-xs text-sky-800'>
                  Create a sprint in Planning to start scheduling this work.
                </p>
              )}
            <div className='mt-3 space-y-2'>
              {readyWithoutSprint.length === 0 ? (
                <p className='rounded-lg border border-dashed border-sky-200 px-3 py-2 text-xs text-sky-800'>
                  Everything READY already has a sprint.
                </p>
              ) : (
                readyWithoutSprint.slice(0, 5).map((story) => {
                  const epic = project.epics.find(
                    (ep) => ep.id === story.epicId
                  );
                  return (
                    <div
                      key={story.id}
                      className='rounded-2xl border border-sky-100 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm'
                    >
                      <p className='font-semibold text-slate-900'>
                        {story.title}
                      </p>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                        {epic ? epic.name : 'Untitled epic'} •{' '}
                        {story.points ?? '—'} pts
                      </p>
                      <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                        <label className='flex items-center gap-2'>
                          <span className='text-slate-500'>Sprint</span>
                          <select
                            className='rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700'
                            onChange={(event) =>
                              handleAssignStoryToSprint(
                                story,
                                event.target.value
                              )
                            }
                            defaultValue=''
                            disabled={
                              assignableSprints.length === 0 ||
                              storyActionId === story.id
                            }
                          >
                            <option value='' disabled>
                              Select sprint
                            </option>
                            {assignableSprints.map((sprint) => (
                              <option key={sprint.id} value={sprint.id}>
                                {sprint.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        {storyActionId === story.id && (
                          <span className='text-[11px] font-semibold text-slate-500'>
                            Assigning…
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-white p-6 shadow-[0_30px_70px_rgba(244,63,94,0.15)]'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-rose-500'>
                Risk register
              </p>
              <h3 className='text-xl font-semibold text-slate-900'>
                Approvals & blockers
              </h3>
            </div>
            <span className='rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-rose-600'>
              {riskItems.length || '0'} open
            </span>
          </div>
          {riskItems.length > 0 ? (
            <ul className='mt-5 space-y-3 text-sm text-slate-700'>
              {riskItems.map((item) => (
                <li
                  key={item.id}
                  className='rounded-2xl border border-rose-100/80 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(244,63,94,0.08)]'
                >
                  <p className='font-semibold text-slate-900'>{item.name}</p>
                  <p className='text-xs uppercase tracking-wide text-rose-500'>
                    {statusLabel(item.status)}
                  </p>
                  {item.status === 'AWAITING_APPROVAL' && (
                    <button
                      type='button'
                      onClick={() => handleApproveEpic(item.id)}
                      className='mt-3 rounded-full border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-700 disabled:opacity-50'
                      disabled={epicActionId === item.id}
                    >
                      {epicActionId === item.id ? 'Marking…' : 'Mark approved'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className='mt-4 text-sm text-slate-500'>
              All approvals are green-lighted. Keep listening for new risks.
            </p>
          )}
        </div>
        <div className='rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-[0_30px_70px_rgba(251,191,36,0.2)]'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-amber-500'>
                Support threads
              </p>
              <h3 className='text-xl font-semibold text-slate-900'>
                Recent review calls
              </h3>
            </div>
            <span className='rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-amber-600'>
              {supportThreads.length || '0'} logged
            </span>
          </div>
          {supportThreads.length > 0 ? (
            <ul className='mt-5 space-y-3 text-sm text-slate-700'>
              {supportThreads.map((meeting) => (
                <li
                  key={meeting.id}
                  className='rounded-2xl border border-amber-100/80 bg-white/90 px-4 py-3 shadow-[0_10px_30px_rgba(251,191,36,0.15)]'
                >
                  <div className='flex items-center justify-between text-xs font-semibold text-amber-600'>
                    <span>{meeting.type}</span>
                    <span>
                      {new Date(meeting.scheduledAt).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                  </div>
                  <p className='mt-2 font-semibold text-slate-900'>
                    {meeting.summary}
                  </p>
                  {meeting.notes && (
                    <p className='text-xs text-slate-500 mt-1'>
                      {meeting.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className='mt-4 text-sm text-slate-500'>
              No review notes logged this sprint. Capture the next touchpoint.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
