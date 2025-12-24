import { FormEvent, useMemo } from 'react';
import { ProjectDetail, StoryStage } from '../../../types/domain';
import { useDomainModal } from '../../domain/DomainModalProvider';

const boardColumns: { key: StoryStage; label: string; helper: string }[] = [
  { key: 'BACKLOG', label: 'Backlog', helper: 'Ideas not yet prioritized' },
  { key: 'READY', label: 'Ready', helper: 'Groomed and estimated' },
  { key: 'IN_PROGRESS', label: 'In progress', helper: 'Committed work' },
  { key: 'IN_REVIEW', label: 'Review', helper: 'QA or approval' },
  { key: 'DONE', label: 'Done', helper: 'Accepted by PO' },
];

const stageOptions: { key: StoryStage; label: string }[] = boardColumns.map(
  ({ key, label }) => ({ key, label })
);

type StoryFormState = {
  epicId: string;
  title: string;
  acceptanceCriteria: string;
};

type SprintFormState = {
  name: string;
  goal: string;
  startAt: string;
  endAt: string;
};

interface PlanningAdminViewProps {
  project: ProjectDetail;
  storyForm: StoryFormState;
  onStoryFormChange: (
    updater: (prev: StoryFormState) => StoryFormState
  ) => void;
  onCreateStory: () => void;
  creatingStory: boolean;
  onUpdateStoryStage: (storyId: string, stage: StoryStage) => void;
  sprintForm: SprintFormState;
  onSprintFormChange: (
    updater: (prev: SprintFormState) => SprintFormState
  ) => void;
  onCreateSprint: () => void;
  creatingSprint: boolean;
}

export function PlanningAdminView({
  project,
  storyForm,
  onStoryFormChange,
  onCreateStory,
  creatingStory,
  onUpdateStoryStage,
  sprintForm,
  onSprintFormChange,
  onCreateSprint,
  creatingSprint,
}: PlanningAdminViewProps) {
  const { openStory } = useDomainModal();
  const groupedStories = useMemo(() => {
    return boardColumns.map((column) => ({
      column,
      stories: project.stories.filter((story) => story.stage === column.key),
    }));
  }, [project.stories]);

  const stats = useMemo(() => {
    const count = (stage: StoryStage) =>
      project.stories.filter((story) => story.stage === stage).length;
    return {
      backlog: count('BACKLOG'),
      ready: count('READY'),
      inProgress: count('IN_PROGRESS'),
      done: count('DONE'),
    };
  }, [project.stories]);

  const activeSprint = project.sprints.find((s) => s.status === 'ACTIVE');
  const upcomingSprint = project.sprints.find((s) => s.status === 'PLANNED');

  const handleStorySubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    onCreateStory();
  };

  const handleSprintSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    onCreateSprint();
  };

  const formatDate = (value: string | undefined) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,3fr),minmax(260px,1fr)]'>
      <section className='space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
        <header className='flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Scrum board
            </p>
            <h2 className='text-2xl font-semibold text-slate-900'>
              {activeSprint ? activeSprint.name : 'Plan the next sprint'}
            </h2>
            <p className='text-sm text-slate-500'>
              Keep backlog, commitment, and review flow in one place for the
              team.
            </p>
          </div>
          <div className='grid grid-cols-2 gap-3 text-center text-xs text-slate-500'>
            <div>
              <p className='font-semibold text-slate-900 text-base'>
                {stats.backlog}
              </p>
              <p>Backlog</p>
            </div>
            <div>
              <p className='font-semibold text-slate-900 text-base'>
                {stats.inProgress}
              </p>
              <p>In progress</p>
            </div>
            <div>
              <p className='font-semibold text-slate-900 text-base'>
                {stats.ready}
              </p>
              <p>Ready</p>
            </div>
            <div>
              <p className='font-semibold text-slate-900 text-base'>
                {stats.done}
              </p>
              <p>Done</p>
            </div>
          </div>
        </header>

        <div className='overflow-x-auto pb-2'>
          <div className='grid auto-cols-[minmax(220px,1fr)] grid-flow-col gap-4 min-w-[860px]'>
            {groupedStories.map(({ column, stories }) => (
              <article
                key={column.key}
                className='flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-slate-50 p-3'
              >
                <header>
                  <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                    {column.label}
                  </p>
                  <p className='text-[11px] text-slate-500'>{column.helper}</p>
                </header>
                <p className='mt-2 text-lg font-semibold text-slate-900'>
                  {stories.length}
                </p>
                <div className='mt-3 flex-1 space-y-3 overflow-y-auto pr-1 text-sm'>
                  {stories.length === 0 && (
                    <p className='rounded-md border border-dashed border-slate-300 bg-white/60 px-3 py-2 text-xs text-slate-500'>
                      Nothing here yet.
                    </p>
                  )}
                  {stories.map((story) => {
                    const epic = project.epics.find(
                      (e) => e.id === story.epicId
                    );
                    return (
                      <div
                        key={story.id}
                        className='rounded-md border border-white bg-white p-3 shadow-sm'
                      >
                        <button
                          type='button'
                          className='w-full text-left'
                          onClick={() => openStory(story.id)}
                        >
                          <p className='font-semibold text-slate-900'>
                            {story.title}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {epic ? epic.name : 'No epic linked'}
                          </p>
                        </button>
                        <select
                          className='mt-2 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase text-slate-600'
                          value={story.stage}
                          onChange={(e) =>
                            onUpdateStoryStage(
                              story.id,
                              e.target.value as StoryStage
                            )
                          }
                          onClick={(event) => event.stopPropagation()}
                        >
                          {stageOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <aside className='space-y-4'>
        <section className='rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            Sprint status
          </p>
          {activeSprint ? (
            <div className='mt-2 space-y-1'>
              <p className='text-base font-semibold text-slate-900'>
                {activeSprint.name}
              </p>
              <p>
                {formatDate(activeSprint.startAt)} –{' '}
                {formatDate(activeSprint.endAt)}
              </p>
              <p>
                {stats.inProgress +
                  groupedStories.find((g) => g.column.key === 'IN_REVIEW')!
                    .stories.length}
                {' pending · '}
                {stats.done} done
              </p>
            </div>
          ) : upcomingSprint ? (
            <div className='mt-2 space-y-1'>
              <p className='text-base font-semibold text-slate-900'>
                Next sprint: {upcomingSprint.name}
              </p>
              <p>
                {formatDate(upcomingSprint.startAt)} –{' '}
                {formatDate(upcomingSprint.endAt)}
              </p>
              <p>Finalize scope and kick off when ready.</p>
            </div>
          ) : (
            <p className='mt-2'>
              No sprint scheduled. Use the form below to lock dates.
            </p>
          )}
        </section>

        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='text-base font-semibold text-slate-900'>
            Add backlog item
          </h3>
          {project.epics.length === 0 ? (
            <p className='mt-2 text-sm text-slate-500'>
              Create an epic first to attach new stories.
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
                  value={storyForm.epicId}
                  onChange={(e) =>
                    onStoryFormChange((prev) => ({
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
                  value={storyForm.title}
                  onChange={(e) =>
                    onStoryFormChange((prev) => ({
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
                  value={storyForm.acceptanceCriteria}
                  onChange={(e) =>
                    onStoryFormChange((prev) => ({
                      ...prev,
                      acceptanceCriteria: e.target.value,
                    }))
                  }
                />
              </label>
              <button
                type='submit'
                disabled={
                  creatingStory || !storyForm.epicId || !storyForm.title.trim()
                }
                className='w-full rounded-md bg-slate-900 py-2 text-sm font-semibold text-white disabled:opacity-50'
              >
                {creatingStory ? 'Adding…' : 'Add to backlog'}
              </button>
            </form>
          )}
        </section>

        <section className='rounded-xl border border-slate-200 bg-white p-4'>
          <h3 className='text-base font-semibold text-slate-900'>
            Schedule sprint
          </h3>
          <form
            className='mt-3 space-y-3 text-sm'
            onSubmit={handleSprintSubmit}
          >
            <label className='flex flex-col gap-1 text-slate-600'>
              Name
              <input
                className='rounded-md border border-slate-300 px-2 py-1'
                value={sprintForm.name}
                onChange={(e) =>
                  onSprintFormChange((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </label>
            <label className='flex flex-col gap-1 text-slate-600'>
              Goal
              <input
                className='rounded-md border border-slate-300 px-2 py-1'
                value={sprintForm.goal}
                onChange={(e) =>
                  onSprintFormChange((prev) => ({
                    ...prev,
                    goal: e.target.value,
                  }))
                }
              />
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <label className='flex flex-col gap-1 text-slate-600'>
                Starts
                <input
                  type='date'
                  className='rounded-md border border-slate-300 px-2 py-1'
                  value={sprintForm.startAt}
                  onChange={(e) =>
                    onSprintFormChange((prev) => ({
                      ...prev,
                      startAt: e.target.value,
                    }))
                  }
                />
              </label>
              <label className='flex flex-col gap-1 text-slate-600'>
                Ends
                <input
                  type='date'
                  className='rounded-md border border-slate-300 px-2 py-1'
                  value={sprintForm.endAt}
                  onChange={(e) =>
                    onSprintFormChange((prev) => ({
                      ...prev,
                      endAt: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <button
              type='submit'
              disabled={creatingSprint || !sprintForm.name.trim()}
              className='w-full rounded-md border border-slate-300 bg-white py-2 text-sm font-semibold text-slate-900 disabled:opacity-50'
            >
              {creatingSprint ? 'Saving…' : 'Save sprint'}
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
