import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Modal } from '../ui/Modal';
import { useServices } from '../../context/ServiceContext';
import {
  ProjectDetail,
  Story,
  StoryStage,
  EpicStatus,
} from '../../types/domain';

export type DomainModalType = 'story' | 'epic' | 'sprint' | 'meeting';

export type DomainModalTarget =
  | { type: 'story'; id: string }
  | { type: 'epic'; id: string }
  | { type: 'sprint'; id: string }
  | { type: 'meeting'; id: string };

interface DomainModalContextValue {
  openStory: (storyId: string) => void;
  openEpic: (epicId: string) => void;
  openSprint: (sprintId: string) => void;
  openMeeting: (meetingId: string) => void;
  open: (target: DomainModalTarget) => void;
  close: () => void;
  activeTarget: DomainModalTarget | null;
}

const DomainModalContext = createContext<DomainModalContextValue | null>(null);

interface DomainModalProviderProps {
  project: ProjectDetail;
  setProject: (project: ProjectDetail) => void;
  children: ReactNode;
}

export function DomainModalProvider({
  project,
  setProject,
  children,
}: DomainModalProviderProps) {
  const { project: projectService } = useServices();
  const [target, setTarget] = useState<DomainModalTarget | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const close = useCallback(() => setTarget(null), []);

  const open = useCallback((next: DomainModalTarget) => {
    setTarget(next);
  }, []);

  const value = useMemo<DomainModalContextValue>(
    () => ({
      openStory: (storyId) => open({ type: 'story', id: storyId }),
      openEpic: (epicId) => open({ type: 'epic', id: epicId }),
      openSprint: (sprintId) => open({ type: 'sprint', id: sprintId }),
      openMeeting: (meetingId) => open({ type: 'meeting', id: meetingId }),
      open,
      close,
      activeTarget: target,
    }),
    [close, open, target]
  );

  const story = useMemo(() => {
    if (target?.type !== 'story') return null;
    return project.stories.find((item) => item.id === target.id) ?? null;
  }, [project.stories, target]);

  const epic = useMemo(() => {
    if (target?.type !== 'epic') return null;
    return project.epics.find((item) => item.id === target.id) ?? null;
  }, [project.epics, target]);

  const sprint = useMemo(() => {
    if (target?.type !== 'sprint') return null;
    return project.sprints.find((item) => item.id === target.id) ?? null;
  }, [project.sprints, target]);

  const meeting = useMemo(() => {
    if (target?.type !== 'meeting') return null;
    return project.meetings.find((item) => item.id === target.id) ?? null;
  }, [project.meetings, target]);

  const resetPending = () => setPendingId(null);

  const handleStoryStageChange = async (storyId: string, stage: StoryStage) => {
    setPendingId(storyId);
    try {
      const updated = await projectService.updateStoryStage(
        project.id,
        storyId,
        stage
      );
      setProject(updated);
    } finally {
      resetPending();
    }
  };

  const handleStorySprintChange = async (
    story: Story,
    sprintId: string | null
  ) => {
    setPendingId(story.id);
    try {
      const updated = await projectService.updateStory(project.id, story.id, {
        epicId: story.epicId,
        title: story.title,
        description: story.description,
        acceptanceCriteria: story.acceptanceCriteria,
        points: story.points,
        sprintId: sprintId ?? null,
        stage: story.stage,
        planningOrder: story.planningOrder ?? null,
      });
      setProject(updated);
    } finally {
      resetPending();
    }
  };

  const handleEpicStatusChange = async (epicId: string, status: EpicStatus) => {
    setPendingId(epicId);
    try {
      const updated = await projectService.updateEpicStatus(
        project.id,
        epicId,
        status
      );
      setProject(updated);
    } finally {
      resetPending();
    }
  };

  const stageOptions: StoryStage[] = [
    'BACKLOG',
    'READY',
    'IN_PROGRESS',
    'IN_REVIEW',
    'DONE',
  ];

  const epicStatusOptions: EpicStatus[] = [
    'PLANNED',
    'AWAITING_APPROVAL',
    'APPROVED',
    'IN_PROGRESS',
    'DONE',
  ];

  return (
    <DomainModalContext.Provider value={value}>
      {children}
      {story && (
        <Modal
          open
          onClose={close}
          title={story.title}
          description='Story overview'
          width='lg'
        >
          <div className='space-y-4 text-sm text-slate-700'>
            <div className='flex flex-wrap items-center gap-3 text-xs'>
              <label className='flex items-center gap-2 font-semibold text-slate-600'>
                Stage
                <select
                  className='rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold'
                  value={story.stage}
                  onChange={(event) =>
                    handleStoryStageChange(
                      story.id,
                      event.target.value as StoryStage
                    )
                  }
                  disabled={pendingId === story.id}
                >
                  {stageOptions.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <div className='rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600'>
                {story.points ? `${story.points} pts` : 'Unestimated'}
              </div>
            </div>
            {story.description && (
              <p className='text-slate-600'>{story.description}</p>
            )}
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                Acceptance criteria
              </p>
              <ul className='mt-2 space-y-1 text-sm'>
                {story.acceptanceCriteria.map((criteria, index) => (
                  <li key={criteria + index} className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-slate-400' />
                    <span>{criteria}</span>
                  </li>
                ))}
                {story.acceptanceCriteria.length === 0 && (
                  <li className='text-xs text-slate-500'>
                    No acceptance criteria recorded.
                  </li>
                )}
              </ul>
            </div>
            <div className='grid gap-4 md:grid-cols-2 text-xs'>
              <div className='rounded-2xl border border-slate-200 p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                  Epic
                </p>
                {story.epicId ? (
                  <button
                    type='button'
                    className='mt-1 font-semibold text-slate-900 underline-offset-4 hover:underline'
                    onClick={() => value.openEpic(story.epicId!)}
                  >
                    {project.epics.find(
                      (epicItem) => epicItem.id === story.epicId
                    )?.name ?? 'View epic'}
                  </button>
                ) : (
                  <p className='mt-1 text-slate-500'>
                    Not attached to an epic.
                  </p>
                )}
              </div>
              <div className='rounded-2xl border border-slate-200 p-3'>
                <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                  Sprint assignment
                </p>
                <select
                  className='mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold'
                  value={story.sprintId ?? ''}
                  onChange={(event) =>
                    handleStorySprintChange(
                      story,
                      event.target.value === '' ? null : event.target.value
                    )
                  }
                  disabled={pendingId === story.id}
                >
                  <option value=''>Unassigned</option>
                  {project.sprints.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type='button'
              className='text-xs font-semibold text-slate-500 underline-offset-4 hover:underline'
              onClick={close}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
      {epic && (
        <Modal
          open
          onClose={close}
          title={epic.name}
          description='Epic overview'
          width='lg'
        >
          <div className='space-y-4 text-sm text-slate-700'>
            <div className='flex flex-wrap items-center gap-3 text-xs'>
              <label className='flex items-center gap-2 font-semibold text-slate-600'>
                Status
                <select
                  className='rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold'
                  value={epic.status}
                  onChange={(event) =>
                    handleEpicStatusChange(
                      epic.id,
                      event.target.value as EpicStatus
                    )
                  }
                  disabled={pendingId === epic.id}
                >
                  {epicStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>
              <span className='rounded-full border border-slate-200 px-3 py-1 text-slate-600'>
                {
                  project.stories.filter(
                    (storyItem) => storyItem.epicId === epic.id
                  ).length
                }{' '}
                stories
              </span>
            </div>
            {epic.description && <p>{epic.description}</p>}
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                Acceptance criteria
              </p>
              <ul className='mt-2 space-y-1 text-sm'>
                {epic.acceptanceCriteria.map((criteria) => (
                  <li key={criteria} className='flex items-start gap-2'>
                    <span className='mt-1 h-1.5 w-1.5 rounded-full bg-slate-400' />
                    <span>{criteria}</span>
                  </li>
                ))}
                {epic.acceptanceCriteria.length === 0 && (
                  <li className='text-xs text-slate-500'>
                    No acceptance criteria recorded.
                  </li>
                )}
              </ul>
            </div>
            <div className='space-y-2'>
              <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
                Stories
              </p>
              <div className='grid gap-2 max-h-64 overflow-y-auto pr-2'>
                {project.stories
                  .filter((storyItem) => storyItem.epicId === epic.id)
                  .map((storyItem) => (
                    <button
                      key={storyItem.id}
                      type='button'
                      className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm hover:border-slate-300'
                      onClick={() => value.openStory(storyItem.id)}
                    >
                      <p className='font-semibold text-slate-900'>
                        {storyItem.title}
                      </p>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                        {storyItem.stage.replace('_', ' ').toLowerCase()} •{' '}
                        {storyItem.points ?? '—'} pts
                      </p>
                    </button>
                  ))}
                {project.stories.filter(
                  (storyItem) => storyItem.epicId === epic.id
                ).length === 0 && (
                  <p className='text-xs text-slate-500'>
                    No stories linked yet.
                  </p>
                )}
              </div>
            </div>
            <button
              type='button'
              className='text-xs font-semibold text-slate-500 underline-offset-4 hover:underline'
              onClick={close}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
      {sprint && (
        <Modal
          open
          onClose={close}
          title={sprint.name}
          description='Sprint summary'
          width='lg'
        >
          <div className='space-y-4 text-sm text-slate-700'>
            <p className='text-xs text-slate-500'>
              {new Date(sprint.startAt).toLocaleDateString()} –{' '}
              {new Date(sprint.endAt).toLocaleDateString()} • Goal:{' '}
              {sprint.goal || 'Unset'}
            </p>
            <div className='grid gap-3 md:grid-cols-3 text-center text-xs'>
              <div className='rounded-2xl border border-slate-200 px-3 py-2'>
                <p className='text-2xl font-semibold text-slate-900'>
                  {
                    project.stories.filter(
                      (storyItem) => storyItem.sprintId === sprint.id
                    ).length
                  }
                </p>
                <p className='uppercase tracking-wide text-slate-500'>
                  Stories
                </p>
              </div>
              <div className='rounded-2xl border border-slate-200 px-3 py-2'>
                <p className='text-2xl font-semibold text-slate-900'>
                  {
                    project.stories.filter(
                      (storyItem) =>
                        storyItem.sprintId === sprint.id &&
                        storyItem.stage === 'DONE'
                    ).length
                  }
                </p>
                <p className='uppercase tracking-wide text-slate-500'>Done</p>
              </div>
              <div className='rounded-2xl border border-slate-200 px-3 py-2'>
                <p className='text-2xl font-semibold text-slate-900'>
                  {project.stories
                    .filter((storyItem) => storyItem.sprintId === sprint.id)
                    .reduce(
                      (sum, storyItem) => sum + (storyItem.points ?? 0),
                      0
                    )}
                </p>
                <p className='uppercase tracking-wide text-slate-500'>Points</p>
              </div>
            </div>
            <div className='space-y-2 max-h-72 overflow-y-auto pr-2'>
              {project.stories
                .filter((storyItem) => storyItem.sprintId === sprint.id)
                .map((storyItem) => (
                  <button
                    key={storyItem.id}
                    type='button'
                    className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm hover:border-slate-300'
                    onClick={() => value.openStory(storyItem.id)}
                  >
                    <p className='font-semibold text-slate-900'>
                      {storyItem.title}
                    </p>
                    <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                      {storyItem.stage.replace('_', ' ').toLowerCase()} •{' '}
                      {storyItem.points ?? '—'} pts
                    </p>
                  </button>
                ))}
              {project.stories.filter(
                (storyItem) => storyItem.sprintId === sprint.id
              ).length === 0 && (
                <p className='text-xs text-slate-500'>No stories assigned.</p>
              )}
            </div>
            <button
              type='button'
              className='text-xs font-semibold text-slate-500 underline-offset-4 hover:underline'
              onClick={close}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
      {meeting && (
        <Modal
          open
          onClose={close}
          title={meeting.summary}
          description='Meeting details'
          width='md'
        >
          <div className='space-y-3 text-sm text-slate-700'>
            <p className='text-xs text-slate-500'>
              {meeting.type} • {new Date(meeting.scheduledAt).toLocaleString()}
            </p>
            <p className='text-xs text-slate-500'>Stage: {meeting.stage}</p>
            {meeting.notes && <p className='text-slate-600'>{meeting.notes}</p>}
            <a
              href={meeting.locationUrl}
              className='text-xs font-semibold text-sky-600 underline'
              target='_blank'
              rel='noreferrer'
            >
              Join / open meeting link
            </a>
            <div className='flex items-center gap-4 pt-2'>
              <button
                type='button'
                className='rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-800'
                onClick={async () => {
                  try {
                    await projectService.sendMeetingInvites(
                      project.id,
                      meeting.id
                    );
                    alert('Invites sent!');
                  } catch (e) {
                    alert('Failed to send invites');
                  }
                }}
              >
                Send Invites
              </button>
              <button
                type='button'
                className='text-xs font-semibold text-slate-500 underline-offset-4 hover:underline'
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DomainModalContext.Provider>
  );
}

export function useDomainModal() {
  const ctx = useContext(DomainModalContext);
  if (!ctx) {
    throw new Error('useDomainModal must be used within a DomainModalProvider');
  }
  return ctx;
}
