import { useMemo } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { Card } from '../../../components/ui/card';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';

interface TouchpointItem {
  id: string;
  label: string;
  date: Date;
  summary: string;
  type: string;
}

export default function BusinessProjectOps() {
  const { project } = useProjectWorkspace();

  const opsNotes = project.statusNote ?? 'No open risks right now.';

  const touchpoints: TouchpointItem[] = useMemo(() => {
    return project.meetings
      .map((meeting) => ({
        id: meeting.id,
        label: meeting.type,
        date: new Date(meeting.scheduledAt),
        summary: meeting.summary,
        type: meeting.type,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  }, [project.meetings]);

  const proactiveActions = useMemo(() => {
    const awaitingApproval = project.epics.filter(
      (epic) => epic.status === 'AWAITING_APPROVAL'
    );
    const dependencyStories = project.stories.filter(
      (story) => !story.sprintId
    );
    return {
      awaitingApproval,
      dependencyStories,
    };
  }, [project.epics, project.stories]);

  return (
    <Stack gap={6}>
      <Card className='grid gap-6 md:grid-cols-2'>
        <Stack gap={4}>
          <Stack gap={2}>
            <Text variant='eyebrow'>Operations pulse</Text>
            <Heading level='h2' className='mt-1'>
              What we are watching
            </Heading>
            <Text variant='body' className='text-slate-600 mt-2'>
              {opsNotes}
            </Text>
          </Stack>
          <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600'>
            <Text weight='semibold' className='text-slate-900'>
              Availability
            </Text>
            <Text variant='body'>
              Delivery hours are booked for the next sprint. Ping us if you need
              an urgent change.
            </Text>
          </div>
        </Stack>
        <div className='rounded-2xl border border-slate-100 bg-slate-50 p-4'>
          <Text variant='eyebrow'>Contact</Text>
          <ul className='mt-3 space-y-3 text-sm text-slate-600'>
            <li>
              <span className='font-semibold text-slate-900'>Slack:</span>{' '}
              #client-{project.name.toLowerCase().replace(/\s+/g, '-')}
            </li>
            <li>
              <span className='font-semibold text-slate-900'>
                Priority email:
              </span>{' '}
              support@gergensoftware.com
            </li>
            <li>
              <span className='font-semibold text-slate-900'>On-call:</span> +1
              (402) 555-0192
            </li>
          </ul>
        </div>
      </Card>

      <Card className='grid gap-6 md:grid-cols-2'>
        <Stack gap={4}>
          <Heading level='h3'>Recent touchpoints</Heading>
          <div className='space-y-3 max-h-[360px] overflow-y-auto pr-2'>
            {touchpoints.length > 0 ? (
              touchpoints.map((touch) => (
                <article
                  key={touch.id}
                  className='rounded-2xl border border-slate-100 bg-slate-50 p-3'
                >
                  <div className='flex items-center justify-between text-xs font-semibold text-slate-500'>
                    <span>{touch.type}</span>
                    <span>{touch.date.toLocaleDateString()}</span>
                  </div>
                  <Text weight='semibold' className='text-slate-900 mt-1'>
                    {touch.summary}
                  </Text>
                </article>
              ))
            ) : (
              <Text variant='small' className='text-slate-500'>
                No calls logged yet.
              </Text>
            )}
          </div>
        </Stack>
        <Stack gap={4}>
          <Heading level='h3'>Action items</Heading>
          <div className='space-y-3'>
            <div className='rounded-2xl border border-amber-100 bg-amber-50 p-4'>
              <Text
                variant='small'
                weight='semibold'
                className='text-amber-900'
              >
                Approvals needed
              </Text>
              {proactiveActions.awaitingApproval.length > 0 ? (
                <ul className='mt-2 list-disc list-inside text-sm text-amber-800'>
                  {proactiveActions.awaitingApproval.map((epic) => (
                    <li key={epic.id}>{epic.name}</li>
                  ))}
                </ul>
              ) : (
                <Text variant='small' className='text-amber-800 mt-2'>
                  All epics are green-lit.
                </Text>
              )}
            </div>
            <div className='rounded-2xl border border-rose-100 bg-rose-50 p-4'>
              <Text variant='small' weight='semibold' className='text-rose-900'>
                Dependencies
              </Text>
              {proactiveActions.dependencyStories.length > 0 ? (
                <ul className='mt-2 list-disc list-inside text-sm text-rose-800'>
                  {proactiveActions.dependencyStories.map((story) => (
                    <li key={story.id}>{story.title}</li>
                  ))}
                </ul>
              ) : (
                <Text variant='small' className='text-rose-800 mt-2'>
                  No blocked stories reported.
                </Text>
              )}
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
