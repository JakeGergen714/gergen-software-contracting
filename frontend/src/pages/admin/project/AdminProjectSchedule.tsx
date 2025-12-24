import { useEffect, useMemo, useState } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';
import {
  ProjectDetail,
  ScheduleMeetingInput,
  ProjectStage,
} from '../../../types/domain';
import {
  MeetingScheduler,
  ProjectMeetings,
} from '../../../components/project/ProjectMeetings';
import MeetingCalendar from '../../../components/project/MeetingCalendar';
import { Stack } from '../../../components/ui/container';
import { Card, CardContent } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';

function buildMeetingDraft(stage: ProjectStage): ScheduleMeetingInput {
  const nowIso = new Date().toISOString().slice(0, 16);
  return {
    stage,
    type: 'DISCOVERY',
    scheduledAt: nowIso,
    locationUrl: 'https://meet.jit.si/gergen-demo',
    summary: '',
    notes: '',
  };
}

export default function AdminProjectSchedule() {
  const { project, setProject } = useProjectWorkspace();
  const { project: projectService } = useServices();
  const [meetingDraft, setMeetingDraft] = useState<ScheduleMeetingInput>(() =>
    buildMeetingDraft(project.stage)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMeetingDraft((prev) => ({ ...prev, stage: project.stage }));
  }, [project.stage]);

  const upcoming = useMemo(() => {
    return project.meetings
      .filter(
        (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [project.meetings]);

  const lastMeeting = useMemo(() => {
    const sorted = [...project.meetings].sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
    );
    return sorted.length > 0 ? sorted[0] : undefined;
  }, [project.meetings]);

  const handleSchedule = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated: ProjectDetail = await projectService.addMeeting(
        project.id,
        meetingDraft
      );
      setProject(updated);
      setMeetingDraft(buildMeetingDraft(project.stage));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not schedule meeting'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap={6}>
      <Card className='bg-surface border-border-subtle'>
        <CardContent className='grid gap-6 lg:grid-cols-2 pt-6'>
          <Stack gap={4}>
            <div>
              <Text
                variant='label'
                className='uppercase tracking-wide text-text-muted'
              >
                Next client session
              </Text>
              <Heading
                level='h2'
                className='text-2xl font-semibold mt-1 text-text-primary'
              >
                {upcoming[0]
                  ? new Date(upcoming[0].scheduledAt).toLocaleString(
                      undefined,
                      {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      }
                    )
                  : 'Nothing scheduled'}
              </Heading>
              <Text variant='muted' className='mt-2 text-text-muted'>
                Stay ahead by booking the next review or workshop before the
                client asks.
              </Text>
            </div>
            {lastMeeting && (
              <div className='rounded-2xl border border-border-subtle bg-surface-alt p-4 text-sm text-text-secondary'>
                <Text
                  variant='label'
                  className='uppercase text-text-muted tracking-wide'
                >
                  Last touchpoint
                </Text>
                <Text
                  variant='body'
                  className='font-semibold text-text-primary'
                >
                  {lastMeeting.type}
                </Text>
                <Text variant='body' className='text-text-secondary'>
                  {lastMeeting.summary}
                </Text>
                <Text variant='caption' className='mt-1 text-text-muted'>
                  {new Date(lastMeeting.scheduledAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </Text>
              </div>
            )}
          </Stack>
          <div>
            <MeetingScheduler
              values={meetingDraft}
              onChange={(updater) => setMeetingDraft((prev) => updater(prev))}
              onSubmit={handleSchedule}
              saving={saving}
            />
            {error && (
              <Text variant='body' className='text-brand-strong mt-2'>
                {error}
              </Text>
            )}
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-6 lg:grid-cols-2'>
        <MeetingCalendar
          meetings={project.meetings}
          onSelectDate={(isoLocal) =>
            setMeetingDraft((prev) => ({ ...prev, scheduledAt: isoLocal }))
          }
        />
        <ProjectMeetings meetings={project.meetings} />
      </div>
    </Stack>
  );
}
