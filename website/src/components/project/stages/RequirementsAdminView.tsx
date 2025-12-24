import { ProjectDetail, ScheduleMeetingInput } from '../../../types/domain';
import { ProjectRoadmap } from '../ProjectRoadmap';
import { ProjectMeetings, MeetingScheduler } from '../ProjectMeetings';
import { ProjectSprints } from '../ProjectSprints';

interface RequirementsAdminViewProps {
  project: ProjectDetail;
  meetingDraft: ScheduleMeetingInput;
  onMeetingDraftChange: (
    updater: (prev: ScheduleMeetingInput) => ScheduleMeetingInput
  ) => void;
  onScheduleMeeting: () => void;
  meetingSaving: boolean;
}

export function RequirementsAdminView({
  project,
  meetingDraft,
  onMeetingDraftChange,
  onScheduleMeeting,
  meetingSaving,
}: RequirementsAdminViewProps) {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_40px_rgba(15,23,42,0.06)]'>
        <h2 className='text-xl font-semibold text-slate-900'>
          Requirements checklist
        </h2>
        <p className='text-sm text-slate-600 mt-2'>
          Log every discovery session, capture decisions, and be ready to flip
          the project into planning with confidence.
        </p>
        <ul className='mt-4 text-sm text-slate-600 space-y-2 list-disc list-inside'>
          <li>Ensure kickoff + workflow interviews are scheduled.</li>
          <li>Document integration constraints and approval workflows.</li>
          <li>Collect artifacts (screenshots, exports) for planning.</li>
        </ul>
      </section>

      <section className='grid lg:grid-cols-2 gap-6'>
        <ProjectMeetings
          meetings={project.meetings}
          actionSlot={
            <MeetingScheduler
              values={meetingDraft}
              onChange={onMeetingDraftChange}
              onSubmit={onScheduleMeeting}
              saving={meetingSaving}
            />
          }
        />
        <ProjectRoadmap project={project} />
      </section>

      <ProjectSprints sprints={project.sprints} />
    </div>
  );
}
