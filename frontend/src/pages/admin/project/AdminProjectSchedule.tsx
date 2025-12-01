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
    <div className='space-y-6'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_35px_rgba(15,23,42,0.08)] grid gap-6 lg:grid-cols-2'>
        <div>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Next client session
          </p>
          <h2 className='text-2xl font-semibold text-slate-900 mt-1'>
            {upcoming[0]
              ? new Date(upcoming[0].scheduledAt).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })
              : 'Nothing scheduled'}
          </h2>
          <p className='text-sm text-slate-500 mt-2'>
            Stay ahead by booking the next review or workshop before the client
            asks.
          </p>
          {lastMeeting && (
            <div className='mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600'>
              <p className='text-xs uppercase text-slate-500 tracking-wide'>
                Last touchpoint
              </p>
              <p className='font-semibold text-slate-900'>{lastMeeting.type}</p>
              <p>{lastMeeting.summary}</p>
              <p className='text-xs text-slate-500 mt-1'>
                {new Date(lastMeeting.scheduledAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
        <div>
          <MeetingScheduler
            values={meetingDraft}
            onChange={(updater) => setMeetingDraft((prev) => updater(prev))}
            onSubmit={handleSchedule}
            saving={saving}
          />
          {error && <p className='text-sm text-rose-600 mt-2'>{error}</p>}
        </div>
      </section>

      <div className='grid gap-6 lg:grid-cols-2'>
        <MeetingCalendar
          meetings={project.meetings}
          onSelectDate={(isoLocal) =>
            setMeetingDraft((prev) => ({ ...prev, scheduledAt: isoLocal }))
          }
        />
        <ProjectMeetings meetings={project.meetings} />
      </div>
    </div>
  );
}
