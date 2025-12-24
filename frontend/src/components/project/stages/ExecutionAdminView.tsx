import { useMemo } from 'react';
import { ProjectDetail } from '../../../types/domain';
import { useDomainModal } from '../../domain/DomainModalProvider';

export function ExecutionAdminView({ project }: { project: ProjectDetail }) {
  const { openStory, openEpic, openSprint } = useDomainModal();
  const groupedStories = useMemo(() => {
    return project.epics.map((epic) => ({
      epic,
      stories: project.stories.filter((story) => story.epicId === epic.id),
    }));
  }, [project.epics, project.stories]);

  const activeSprint = project.sprints.find((s) => s.status === 'ACTIVE');
  const pastSprints = project.sprints.filter((s) => s.status === 'COMPLETE');

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl font-semibold text-slate-900'>
            Sprint execution
          </h2>
          <p className='text-slate-600'>
            Manage current sprint outcomes, update notes, and keep the
            client-facing progress up to date.
          </p>
        </div>
        <div className='mt-4 grid md:grid-cols-2 gap-4'>
          {activeSprint ? (
            <button
              type='button'
              onClick={() => openSprint(activeSprint.id)}
              className='rounded-2xl border border-brand-soft bg-brand-soft/50 p-4 text-left'
            >
              <p className='text-xs uppercase text-brand-solid font-semibold'>
                Active sprint
              </p>
              <p className='text-lg font-semibold text-brand-solid'>
                {activeSprint.name}
              </p>
              <p className='text-sm text-brand-solid'>{activeSprint.goal}</p>
              <p className='text-xs text-brand-solid mt-1'>
                {new Date(activeSprint.startAt).toLocaleDateString()} –
                {new Date(activeSprint.endAt).toLocaleDateString()}
              </p>
            </button>
          ) : (
            <div className='rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-500'>
              No active sprint.
            </div>
          )}
          <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600'>
            <p className='text-xs uppercase text-slate-500 font-semibold'>
              Past sprints
            </p>
            {pastSprints.length > 0 ? (
              <ul className='mt-2 space-y-1'>
                {pastSprints.map((sprint) => (
                  <li key={sprint.id}>
                    <button
                      type='button'
                      onClick={() => openSprint(sprint.id)}
                      className='font-medium text-slate-800 hover:underline'
                    >
                      {sprint.name}
                    </button>{' '}
                    · {new Date(sprint.endAt).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='mt-2 text-xs text-slate-400'>
                No past sprints yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-white/70 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)] space-y-4'>
        <h3 className='text-xl font-semibold text-slate-900'>
          Stories by epic
        </h3>
        {groupedStories.length > 0 ? (
          groupedStories.map(({ epic, stories }) => (
            <div
              key={epic.id}
              className='rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3'
            >
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  onClick={() => openEpic(epic.id)}
                  className='flex items-center gap-3 text-left'
                >
                  <span
                    className='w-2 h-2 rounded-full'
                    style={{ backgroundColor: epic.color }}
                  />
                  <p className='font-semibold text-slate-900'>{epic.name}</p>
                </button>
                <span className='text-xs text-slate-500'>
                  {stories.length} stories
                </span>
              </div>
              <div className='grid md:grid-cols-2 gap-3 text-sm'>
                {stories.length > 0 ? (
                  stories.map((story) => (
                    <button
                      key={story.id}
                      type='button'
                      onClick={() => openStory(story.id)}
                      className='rounded-xl border border-white bg-white/70 p-3 text-left shadow-[0_5px_15px_rgba(15,23,42,0.07)]'
                    >
                      <p className='font-semibold text-slate-900'>
                        {story.title}
                      </p>
                      <p className='text-xs uppercase text-slate-500 mt-1'>
                        {story.stage.replace('_', ' ').toLowerCase()}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className='text-xs text-slate-400'>
                    No stories mapped to this epic yet.
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className='text-sm text-slate-500'>No epics to show.</p>
        )}
      </section>
    </div>
  );
}
