import { useMemo, useState } from 'react';
import { Meeting } from '../../types/domain';

interface MeetingCalendarProps {
  meetings: Meeting[];
  onSelectDate?: (isoLocalDateTime: string) => void; // YYYY-MM-DDTHH:MM (local)
  month?: Date;
}

function formatLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function MeetingCalendar({
  meetings,
  onSelectDate,
  month,
}: MeetingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(
    () => month || new Date()
  );

  const monthLabel = currentMonth.toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const monthDays = useMemo(() => {
    const start = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const end = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    );

    // Days to prepend (Sunday start)
    const leading = start.getDay();
    const days: Date[] = [];
    for (let i = 0; i < leading; i++) {
      days.push(
        new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() - (leading - i)
        )
      );
    }
    for (let d = 1; d <= end.getDate(); d++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d)
      );
    }
    // Pad to complete final week (42 cells total for 6 rows)
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1];
      days.push(
        new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
      );
    }
    if (days.length < 42) {
      const last = days[days.length - 1];
      while (days.length < 42) {
        days.push(
          new Date(
            last.getFullYear(),
            last.getMonth(),
            last.getDate() + (days.length - (days.length - 1))
          )
        );
      }
    }
    return days;
  }, [currentMonth]);

  const meetingsByDate = useMemo(() => {
    const map: Record<string, Meeting[]> = {};
    meetings.forEach((m) => {
      const key = new Date(m.scheduledAt).toDateString();
      map[key] = map[key] || [];
      map[key].push(m);
    });
    return map;
  }, [meetings]);

  const handlePrev = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };
  const handleNext = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isSameMonth = (d: Date) => d.getMonth() === currentMonth.getMonth();

  return (
    <section className='rounded-3xl border border-white/70 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.05)] space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-slate-900'>Calendar</h2>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={handlePrev}
            className='rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200'
          >
            Prev
          </button>
          <button
            type='button'
            onClick={handleNext}
            className='rounded-full bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200'
          >
            Next
          </button>
        </div>
      </div>
      <p className='text-sm text-slate-500'>{monthLabel}</p>
      <div className='grid grid-cols-7 gap-2 text-xs font-medium text-slate-500'>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className='text-center'>
            {d}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-2'>
        {monthDays.map((day) => {
          const key = day.toDateString();
          const dayMeetings = meetingsByDate[key] || [];
          const inMonth = isSameMonth(day);
          return (
            <button
              key={day.getTime()}
              type='button'
              onClick={() => {
                if (!onSelectDate) return;
                // Default time 10:00 local
                const local = new Date(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate(),
                  10,
                  0,
                  0
                );
                onSelectDate(formatLocalInput(local));
              }}
              className={`h-20 rounded-2xl border flex flex-col items-start p-2 text-left relative group transition-colors ${
                inMonth
                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  : 'border-slate-100 bg-white text-slate-300'
              }`}
            >
              <span className='text-xs font-medium'>{day.getDate()}</span>
              {dayMeetings.length > 0 && (
                <div className='mt-1 flex flex-col gap-1 w-full'>
                  {dayMeetings.slice(0, 3).map((m) => (
                    <span
                      key={m.id}
                      className='truncate rounded-md bg-slate-900/10 text-[10px] px-1 py-0.5'
                      title={m.summary}
                    >
                      {new Date(m.scheduledAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: 'numeric',
                      })}{' '}
                      {m.type}
                    </span>
                  ))}
                  {dayMeetings.length > 3 && (
                    <span className='text-[10px] text-slate-500'>
                      +{dayMeetings.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {onSelectDate && (
        <p className='text-xs text-slate-500'>
          Click a day to preset the scheduled time (10:00).
        </p>
      )}
    </section>
  );
}
