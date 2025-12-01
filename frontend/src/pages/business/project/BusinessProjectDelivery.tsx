import { useMemo, useState } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';
import type { CreateEpicInput } from '../../../types/domain';

interface SprintSummary {
  id: string;
  name: string;
  status: string;
  startAt: Date;
  endAt: Date;
  goal: string;
  notes?: string;
  storyCount: number;
  doneCount: number;
  progress: number;
}

function toDate(value: string) {
  return new Date(value);
}

function formatDateRange(start: Date, end: Date) {
  return `${start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${end.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
}

export default function BusinessProjectDelivery() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();

  const [epicDraft, setEpicDraft] = useState<CreateEpicInput>({
    name: '',
    description: '',
    color: '#f59e42',
    acceptanceCriteria: [],
    clientSummary: '',
  });
  const [savingEpic, setSavingEpic] = useState(false);
  const [epicError, setEpicError] = useState<string | null>(null);

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEpic(true);
    setEpicError(null);
    try {
      const updated = await projectService.createEpic(project.id, epicDraft);
      setProject(updated);
      setEpicDraft({
        name: '',
        description: '',
        color: '#f59e42',
        acceptanceCriteria: [],
        clientSummary: '',
      });
    } catch (err) {
      setEpicError(
        err instanceof Error ? err.message : 'Could not create epic'
      );
    } finally {
      setSavingEpic(false);
    }
  };

  const sprints: SprintSummary[] = useMemo(() => {
    return project.sprints
      .map((sprint) => {
        const stories = project.stories.filter(
          (story) => story.sprintId === sprint.id
        );
        const done = stories.filter((story) => story.stage === 'DONE').length;
        const progress = stories.length
          ? Math.round((done / stories.length) * 100)
          : 0;
        return {
          id: sprint.id,
          name: sprint.name,
          status: sprint.status,
          startAt: toDate(sprint.startAt),
          endAt: toDate(sprint.endAt),
          goal: sprint.goal,
          notes: sprint.notes,
          storyCount: stories.length,
          doneCount: done,
          progress,
        } satisfies SprintSummary;
      })
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [project.sprints, project.stories]);

  const epicProgress = useMemo(() => {
    const storiesByEpic = new Map<string, { total: number; done: number }>();
    for (const story of project.stories) {
      const bucket = storiesByEpic.get(story.epicId) ?? { total: 0, done: 0 };
      bucket.total += 1;
      if (story.stage === 'DONE') bucket.done += 1;
      storiesByEpic.set(story.epicId, bucket);
    }

    const epicPercents = project.epics.map((epic) => {
      const bucket = storiesByEpic.get(epic.id);
      if (!bucket || bucket.total === 0) return 0;
      return Math.round((bucket.done / bucket.total) * 100);
    });

    const projectPercent = epicPercents.length
      ? Math.round(
          epicPercents.reduce((sum, p) => sum + p, 0) / epicPercents.length
        )
      : 0;

    return {
      projectPercent,
      byEpic: new Map(
        project.epics.map((epic, idx) => [epic.id, epicPercents[idx] ?? 0])
      ),
    } as const;
  }, [project.epics, project.stories]);

  const activeSprint =
    sprints.find((s) => s.status === 'ACTIVE') ??
    (sprints.length > 0 ? sprints[sprints.length - 1] : null);
  const now = Date.now();
  const daysLeft = activeSprint
    ? Math.max(
        0,
        Math.ceil((activeSprint.endAt.getTime() - now) / (1000 * 60 * 60 * 24))
      )
    : null;

  return (
    <div className='space-y-6'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]'>
        <div className='flex flex-col gap-3'>
          <h2 className='text-2xl font-semibold text-slate-900'>Delivery</h2>
          <div className='space-y-1'>
            <p className='text-xs uppercase font-semibold tracking-wide text-slate-500'>
              Overall progress
            </p>
            <div className='flex items-center gap-3'>
              <div className='h-2 flex-1 rounded-full bg-slate-100 overflow-hidden'>
                <div
                  className='h-full rounded-full bg-emerald-500 transition-all'
                  style={{ width: `${epicProgress.projectPercent}%` }}
                />
              </div>
              <span className='text-sm font-semibold text-slate-900 w-12 text-right'>
                {epicProgress.projectPercent}%
              </span>
            </div>
          </div>
        </div>
        {activeSprint ? (
          <div className='mt-4 grid gap-4 md:grid-cols-3'>
            <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
              <p className='text-xs uppercase font-semibold tracking-wide text-slate-500'>
                Sprint
              </p>
              <p className='text-xl font-semibold text-slate-900'>
                {activeSprint.name}
              </p>
              <p className='text-sm text-slate-500'>
                {formatDateRange(activeSprint.startAt, activeSprint.endAt)}
              </p>
            </div>
            <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
              <p className='text-xs uppercase font-semibold tracking-wide text-slate-500'>
                Progress
              </p>
              <p className='text-xl font-semibold text-emerald-600'>
                {activeSprint.progress}%
              </p>
              <p className='text-sm text-slate-500'>
                {activeSprint.doneCount} of {activeSprint.storyCount} stories
                accepted
              </p>
            </div>
            <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
              <p className='text-xs uppercase font-semibold tracking-wide text-slate-500'>
                Time remaining
              </p>
              <p className='text-xl font-semibold text-slate-900'>
                {daysLeft !== null
                  ? `${daysLeft} day${daysLeft === 1 ? '' : 's'}`
                  : '—'}
              </p>
            </div>
          </div>
        ) : (
          <p className='text-sm text-slate-500 mt-4'>
            No sprints yet. Once we kick off execution, progress will display
            here.
          </p>
        )}
      </section>

      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <div className='flex flex-col gap-2 mb-4'>
          <h3 className='text-xl font-semibold text-slate-900'>Epics</h3>
          <p className='text-sm text-slate-500'>
            Define the big slices of work we&apos;re committing to deliver.
          </p>
        </div>

        <form className='mb-6 space-y-2' onSubmit={handleCreateEpic}>
          <div className='grid gap-2 md:grid-cols-3'>
            <input
              className='rounded border px-2 py-1 text-sm w-full'
              placeholder='Epic name'
              value={epicDraft.name}
              onChange={(e) =>
                setEpicDraft((d) => ({ ...d, name: e.target.value }))
              }
              required
            />
            <input
              className='rounded border px-2 py-1 text-sm w-full'
              placeholder='Color (hex)'
              value={epicDraft.color}
              onChange={(e) =>
                setEpicDraft((d) => ({ ...d, color: e.target.value }))
              }
            />
            <input
              className='rounded border px-2 py-1 text-sm w-full'
              placeholder='Client-facing summary (optional)'
              value={epicDraft.clientSummary}
              onChange={(e) =>
                setEpicDraft((d) => ({ ...d, clientSummary: e.target.value }))
              }
            />
          </div>
          <textarea
            className='rounded border px-2 py-1 text-sm w-full'
            placeholder='Internal notes / description (optional)'
            rows={2}
            value={epicDraft.description}
            onChange={(e) =>
              setEpicDraft((d) => ({ ...d, description: e.target.value }))
            }
          />
          <button
            type='submit'
            className='rounded bg-sky-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-50'
            disabled={savingEpic || !epicDraft.name.trim()}
          >
            {savingEpic ? 'Saving epic…' : 'Add epic'}
          </button>
          {epicError && (
            <div className='text-rose-600 text-xs mt-1'>{epicError}</div>
          )}
        </form>

        <ul className='space-y-3'>
          {project.epics.length === 0 && (
            <li className='text-sm text-slate-500'>
              No epics yet. Start by adding the main outcomes we want.
            </li>
          )}
          {project.epics.map((epic) => (
            <li
              key={epic.id}
              className='border rounded-2xl p-4 bg-slate-50 flex flex-col gap-2'
            >
              <div className='flex items-center gap-2'>
                <span
                  className='w-3 h-3 rounded-full'
                  style={{ backgroundColor: epic.color }}
                />
                <span className='font-semibold text-slate-900'>
                  {epic.name}
                </span>
                <span className='text-xs px-2 py-1 rounded bg-white border ml-2'>
                  {epic.status.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <div className='flex items-center gap-2 text-xs text-slate-600'>
                <div className='h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden'>
                  <div
                    className='h-full rounded-full bg-sky-500 transition-all'
                    style={{
                      width: `${epicProgress.byEpic.get(epic.id) ?? 0}%`,
                    }}
                  />
                </div>
                <span className='w-10 text-right font-medium'>
                  {epicProgress.byEpic.get(epic.id) ?? 0}%
                </span>
              </div>
              {epic.clientSummary && (
                <p className='text-sm text-slate-700'>{epic.clientSummary}</p>
              )}
              {epic.description && (
                <p className='text-xs text-slate-500'>{epic.description}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
