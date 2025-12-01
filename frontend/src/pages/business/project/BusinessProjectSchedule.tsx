import { useMemo } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';

interface SuggestedSlot {
  date: Date;
  window: string;
  facilitator: string;
}

function generateSuggestedSlots(): SuggestedSlot[] {
  const base = new Date();
  const facilitators = [
    'Taylor (PM)',
    'Jordan (Engineering)',
    'Kelly (Design)',
  ];
  const windows = [
    '9:00 AM - 9:45 AM',
    '11:00 AM - 11:45 AM',
    '2:00 PM - 2:45 PM',
  ];
  const results: SuggestedSlot[] = [];
  for (let dayOffset = 1; dayOffset <= 5; dayOffset += 1) {
    const date = new Date(base.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const facilitator = facilitators[dayOffset % facilitators.length];
    const window = windows[dayOffset % windows.length];
    results.push({ date, window, facilitator });
  }
  return results;
}

export default function BusinessProjectSchedule() {
  const { project } = useProjectWorkspace();

  const upcoming = useMemo(() => {
    const now = Date.now();
    return project.meetings
      .filter((m) => new Date(m.scheduledAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [project.meetings]);

  const past = useMemo(() => {
    const now = Date.now();
    return project.meetings
      .filter((m) => new Date(m.scheduledAt).getTime() < now)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      )
      .slice(0, 5);
  }, [project.meetings]);

  const slots = useMemo(() => generateSuggestedSlots(), []);
  const nextMeeting = upcoming[0] ?? null;
  const slotList = slots.slice(0, 4);

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/80 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.07)] grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]'>
        <div className='space-y-3'>
          <h2 className='text-2xl font-semibold text-slate-900'>Schedule</h2>
          {nextMeeting ? (
            <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-1'>
              <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
                Next on calendar
              </p>
              <p className='text-base font-semibold text-slate-900'>
                {nextMeeting.type}
              </p>
              <p className='text-sm text-slate-600'>
                {new Date(nextMeeting.scheduledAt).toLocaleString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </p>
              <p className='text-sm text-slate-600'>{nextMeeting.summary}</p>
              <a
                className='text-xs font-semibold text-sky-600'
                href={nextMeeting.locationUrl}
                target='_blank'
                rel='noreferrer'
              >
                Join call
              </a>
            </div>
          ) : (
            <p className='text-sm text-slate-500'>
              No meetings scheduled; pick a slot below.
            </p>
          )}
        </div>
        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-semibold text-slate-900'>Open slots</p>
            <span className='text-xs text-slate-500'>Updated daily</span>
          </div>
          <ul className='space-y-2'>
            {slotList.map((slot, idx) => (
              <li
                key={idx}
                className='flex items-center justify-between gap-4 rounded-xl border border-white bg-white px-3 py-2 text-sm text-slate-700'
              >
                <div>
                  <p className='font-semibold text-slate-900'>
                    {slot.date.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className='text-xs text-slate-500'>{slot.window}</p>
                </div>
                <button
                  type='button'
                  className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100'
                >
                  Reserve
                </button>
              </li>
            ))}
          </ul>
          <p className='text-xs text-slate-500 text-center'>
            Need something specific? scheduling@gergensoftware.com
          </p>
        </div>
      </section>

      <section className='rounded-2xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h3 className='text-xl font-semibold text-slate-900'>Timeline</h3>
          </div>
          <span className='text-xs text-slate-500'>
            Showing {Math.min(upcoming.length, 3)} upcoming /{' '}
            {Math.min(past.length, 3)} recent
          </span>
        </div>
        <div className='mt-4 grid gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Next up
            </p>
            {upcoming.length > 0 ? (
              <ul className='space-y-3'>
                {upcoming.slice(0, 3).map((meeting) => (
                  <li
                    key={meeting.id}
                    className='rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700'
                  >
                    <div className='flex items-center justify-between text-slate-900 font-semibold'>
                      <span>{meeting.type}</span>
                      <span>
                        {new Date(meeting.scheduledAt).toLocaleString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    <p className='text-xs text-slate-500 mt-1'>
                      {meeting.summary}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-slate-500'>
                No upcoming sessions yet.
              </p>
            )}
          </div>
          <div className='space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Latest notes
            </p>
            {past.length > 0 ? (
              <ul className='space-y-3'>
                {past.slice(0, 3).map((meeting) => (
                  <li
                    key={meeting.id}
                    className='rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700'
                  >
                    <div className='flex items-center justify-between text-slate-900 font-semibold'>
                      <span>{meeting.type}</span>
                      <span>
                        {new Date(meeting.scheduledAt).toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                    <p className='text-xs text-slate-500 mt-1'>
                      {meeting.summary}
                    </p>
                    {meeting.notes && (
                      <p className='text-xs text-slate-400 mt-1'>
                        {meeting.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-slate-500'>
                Recaps post after the first session.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
