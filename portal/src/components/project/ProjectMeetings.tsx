import { ReactNode, useMemo } from 'react';
import {
  Meeting,
  ProjectStage,
  ScheduleMeetingInput,
} from '../../types/domain';
import { useDomainModal } from '../domain/DomainModalProvider';
import { stageCopy, stageOrder } from './stageMeta';

interface ProjectMeetingsProps {
  meetings: Meeting[];
  actionSlot?: ReactNode;
}

export function ProjectMeetings({
  meetings,
  actionSlot,
}: ProjectMeetingsProps) {
  const { openMeeting } = useDomainModal();
  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const upcomingMeetings = meetings
      .filter((m) => new Date(m.scheduledAt).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    const pastMeetings = meetings
      .filter((m) => new Date(m.scheduledAt).getTime() < now)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
    return { upcoming: upcomingMeetings, past: pastMeetings };
  }, [meetings]);

  return (
    <section className='rounded-3xl border border-white/70 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)] space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-slate-900'>Meetings</h2>
        <p className='text-sm text-slate-500'>Upcoming calls and notes.</p>
        <div className='mt-4 space-y-3'>
          {upcoming.length > 0 ? (
            upcoming.map((meeting) => (
              <button
                key={meeting.id}
                type='button'
                onClick={() => openMeeting(meeting.id)}
                className='w-full rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left text-sm text-slate-600'
              >
                <div className='flex items-center justify-between text-slate-900 font-semibold'>
                  <span>{meeting.type}</span>
                  <span>
                    {new Date(meeting.scheduledAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </span>
                </div>
                <p className='text-slate-500'>{meeting.summary}</p>
              </button>
            ))
          ) : (
            <p className='text-sm text-slate-500'>No upcoming meetings.</p>
          )}
        </div>
      </div>
      {actionSlot}
      {past.length > 0 && (
        <div>
          <p className='text-xs uppercase text-slate-500 tracking-wide'>
            Past meetings
          </p>
          <div className='mt-3 space-y-2 text-sm text-slate-500'>
            {past.map((meeting) => (
              <button
                key={meeting.id}
                type='button'
                onClick={() => openMeeting(meeting.id)}
                className='w-full border border-slate-100 rounded-2xl px-3 py-2 text-left'
              >
                <div className='flex justify-between text-slate-700 font-medium'>
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
                <p>{meeting.summary}</p>
                {meeting.notes && (
                  <p className='text-xs text-slate-400 mt-1'>{meeting.notes}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface MeetingSchedulerProps {
  values: ScheduleMeetingInput;
  onChange: (
    updater: (prev: ScheduleMeetingInput) => ScheduleMeetingInput
  ) => void;
  onSubmit: () => void;
  saving: boolean;
}

export function MeetingScheduler({
  values,
  onChange,
  onSubmit,
  saving,
}: MeetingSchedulerProps) {
  return (
    <div>
      <p className='text-sm text-slate-500 uppercase tracking-wide'>
        Schedule meeting
      </p>
      <div className='mt-3 grid gap-3 text-sm text-slate-600'>
        <label className='flex flex-col gap-1'>
          Title / summary
          <input
            className='rounded-2xl border border-slate-200 px-3 py-2'
            value={values.summary}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, summary: e.target.value }))
            }
          />
        </label>
        <label className='flex flex-col gap-1'>
          Stage
          <select
            className='rounded-2xl border border-slate-200 px-3 py-2'
            value={values.stage}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                stage: e.target.value as ProjectStage,
              }))
            }
          >
            {stageOrder.map((stage) => (
              <option key={stage} value={stage}>
                {stageCopy[stage].title}
              </option>
            ))}
          </select>
        </label>
        <label className='flex flex-col gap-1'>
          Type
          <select
            className='rounded-2xl border border-slate-200 px-3 py-2'
            value={values.type}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                type: e.target.value as ScheduleMeetingInput['type'],
              }))
            }
          >
            <option value='DISCOVERY'>Discovery</option>
            <option value='REVIEW'>Review</option>
            <option value='STANDUP'>Standup</option>
          </select>
        </label>
        <label className='flex flex-col gap-1'>
          When
          <input
            type='datetime-local'
            className='rounded-2xl border border-slate-200 px-3 py-2'
            value={values.scheduledAt}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                scheduledAt: e.target.value,
              }))
            }
          />
        </label>
        <label className='flex flex-col gap-1'>
          Link
          <input
            className='rounded-2xl border border-slate-200 px-3 py-2'
            value={values.locationUrl}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                locationUrl: e.target.value,
              }))
            }
          />
        </label>
        <label className='flex flex-col gap-1'>
          Attendees (comma separated emails)
          <input
            className='rounded-2xl border border-slate-200 px-3 py-2'
            value={values.attendees?.join(', ') || ''}
            onChange={(e) =>
              onChange((prev) => ({
                ...prev,
                attendees: e.target.value.split(',').map((s) => s.trim()),
              }))
            }
            placeholder='alice@example.com, bob@example.com'
          />
        </label>
        <button
          type='button'
          onClick={onSubmit}
          disabled={saving}
          className='rounded-full bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50'
        >
          {saving ? 'Scheduling…' : 'Add meeting'}
        </button>
      </div>
    </div>
  );
}
