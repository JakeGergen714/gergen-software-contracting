import { useMemo } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { Card } from '../../../components/ui/card';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';

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
    <Stack gap={6}>
      <Card className='grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]'>
        <Stack gap={3}>
          <Heading level='h2'>Schedule</Heading>
          {nextMeeting ? (
            <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-1'>
              <Text variant='eyebrow'>Next on calendar</Text>
              <Text weight='semibold'>{nextMeeting.type}</Text>
              <Text variant='small' className='text-slate-600'>
                {new Date(nextMeeting.scheduledAt).toLocaleString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
              <Text variant='small' className='text-slate-600'>
                {nextMeeting.summary}
              </Text>
              <Button
                variant='link'
                className='p-0 h-auto justify-start text-sky-600'
                asChild
              >
                <a
                  href={nextMeeting.locationUrl}
                  target='_blank'
                  rel='noreferrer'
                >
                  Join call
                </a>
              </Button>
            </div>
          ) : (
            <Text variant='small' className='text-slate-500'>
              No meetings scheduled; pick a slot below.
            </Text>
          )}
        </Stack>
        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <Text weight='semibold' variant='small'>
              Open slots
            </Text>
            <Text variant='caption'>Updated daily</Text>
          </div>
          <ul className='space-y-2'>
            {slotList.map((slot, idx) => (
              <li
                key={idx}
                className='flex items-center justify-between gap-4 rounded-xl border border-white bg-white px-3 py-2 text-sm text-slate-700'
              >
                <div>
                  <Text weight='semibold'>
                    {slot.date.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text variant='caption'>{slot.window}</Text>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-full h-7 text-xs'
                >
                  Reserve
                </Button>
              </li>
            ))}
          </ul>
          <Text variant='caption' className='text-center'>
            Need something specific? scheduling@gergensoftware.com
          </Text>
        </div>
      </Card>

      <Card>
        <Stack gap={4}>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <Heading level='h3'>Timeline</Heading>
            </div>
            <Text variant='caption'>
              Showing {Math.min(upcoming.length, 3)} upcoming /{' '}
              {Math.min(past.length, 3)} recent
            </Text>
          </div>
          <div className='grid gap-6 md:grid-cols-2'>
            <Stack gap={2}>
              <Text variant='eyebrow'>Next up</Text>
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
                      <Text variant='caption' className='mt-1'>
                        {meeting.summary}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text variant='small' className='text-slate-500'>
                  No upcoming sessions yet.
                </Text>
              )}
            </Stack>
            <Stack gap={2}>
              <Text variant='eyebrow'>Latest notes</Text>
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
                      <Text variant='caption' className='mt-1'>
                        {meeting.summary}
                      </Text>
                      {meeting.notes && (
                        <Text variant='caption' className='text-slate-400 mt-1'>
                          {meeting.notes}
                        </Text>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <Text variant='small' className='text-slate-500'>
                  Recaps post after the first session.
                </Text>
              )}
            </Stack>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
