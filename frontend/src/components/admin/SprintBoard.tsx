import { Story, StoryStage, Epic } from '../../types/domain';
import { useDomainModal } from '../domain/DomainModalProvider';

const columns: {
  key: StoryStage | 'READY';
  label: string;
  description: string;
}[] = [
  { key: 'READY', label: 'To do', description: 'Ready to pull next' },
  {
    key: 'IN_PROGRESS',
    label: 'In progress',
    description: 'Actively being built',
  },
  { key: 'IN_REVIEW', label: 'Review', description: 'Needs validation' },
  { key: 'DONE', label: 'Done', description: 'Completed this sprint' },
];

const stageClasses: Record<string, string> = {
  READY: 'border-amber-200 bg-amber-50 text-amber-800',
  IN_PROGRESS: 'border-sky-200 bg-sky-50 text-sky-800',
  IN_REVIEW: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  DONE: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

const moveOptions: { key: StoryStage; label: string }[] = [
  { key: 'READY', label: 'Ready' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'IN_REVIEW', label: 'Review' },
  { key: 'DONE', label: 'Done' },
  { key: 'BACKLOG', label: 'Backlog' },
];

export type SprintBoardProps = {
  stories: Story[];
  epics?: Epic[];
  onUpdateStage?: (storyId: string, stage: StoryStage) => void;
};

export function SprintBoard({
  stories,
  epics,
  onUpdateStage,
}: SprintBoardProps) {
  const { openStory, openEpic } = useDomainModal();
  const epicById = new Map(epics?.map((epic) => [epic.id, epic]));
  const itemsByColumn = columns.map((column) => ({
    column,
    items: stories.filter((story) => {
      if (column.key === 'READY') {
        return story.stage === 'READY' || story.stage === 'BACKLOG';
      }
      return story.stage === column.key;
    }),
  }));

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {itemsByColumn.map(({ column, items }) => (
        <section
          key={column.key}
          className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                {column.label}
              </p>
              <p className='text-xs text-slate-500'>{column.description}</p>
            </div>
            <span className='rounded-full border border-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-600'>
              {items.length}
            </span>
          </div>
          <div className='mt-3 space-y-3'>
            {items.length === 0 && (
              <p className='rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500'>
                Nothing yet.
              </p>
            )}
            {items.map((item) => {
              const epic = epicById.get(item.epicId);
              const epicColor = epic?.color ?? '#e5e7eb';
              return (
                <article
                  key={item.id}
                  className='rounded-xl border bg-white p-3 text-sm shadow cursor-pointer'
                  style={{ borderColor: epicColor }}
                  onClick={() => openStory(item.id)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openStory(item.id);
                    }
                  }}
                >
                  <header className='flex items-start justify-between gap-3'>
                    <div>
                      <p className='font-semibold text-slate-900'>
                        {item.title}
                      </p>
                      <p className='text-[11px] uppercase tracking-wide text-slate-500'>
                        {item.acceptanceCriteria.length} checks •{' '}
                        {item.points ?? '—'} pts
                      </p>
                    </div>
                    {epic && (
                      <button
                        type='button'
                        className='flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:underline'
                        onClick={(event) => {
                          event.stopPropagation();
                          openEpic(epic.id);
                        }}
                      >
                        <span
                          className='inline-block h-2 w-2 rounded-full'
                          style={{ backgroundColor: epicColor }}
                        />
                        <span className='max-w-[10rem] truncate'>
                          {epic.name}
                        </span>
                      </button>
                    )}
                  </header>
                  <p className='mt-2 line-clamp-3 text-xs text-slate-600'>
                    {item.description || 'No description provided.'}
                  </p>
                  <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        stageClasses[item.stage] ||
                        'border-slate-200 text-slate-600'
                      }`}
                    >
                      {item.stage.replace('_', ' ').toLowerCase()}
                    </span>
                    {onUpdateStage && (
                      <label className='flex items-center gap-2 text-[11px] text-slate-500'>
                        <span className='uppercase tracking-wide'>Move to</span>
                        <select
                          value={item.stage}
                          onChange={(event) =>
                            onUpdateStage(
                              item.id,
                              event.target.value as StoryStage
                            )
                          }
                          className='rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700'
                          onClick={(event) => event.stopPropagation()}
                        >
                          {moveOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
