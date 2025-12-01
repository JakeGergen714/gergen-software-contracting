import { useMemo, useState, useEffect } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { ProjectStageHeader } from '../../../components/project/ProjectStageHeader';
import { StageControls } from '../../../components/project/StageControls';
import { useServices } from '../../../context/ServiceContext';

export default function AdminProjectOverview() {
  const { project, setProject, advanceStage, stageUpdating, stageError } =
    useProjectWorkspace();
  const { project: projectService } = useServices();

  const [statusNote, setStatusNote] = useState(project.statusNote || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStatusNote(project.statusNote || '');
  }, [project.statusNote]);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const { draft } = await projectService.getStatusDraft(project.id);
      setStatusNote(draft);
    } catch (error) {
      console.error('Failed to generate draft', error);
      alert('Failed to generate draft status note');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      const updated = await projectService.updateStatusNote(
        project.id,
        statusNote
      );
      setProject(updated);
      alert('Status note updated');
    } catch (error) {
      console.error('Failed to save status note', error);
      alert('Failed to save status note');
    } finally {
      setIsSaving(false);
    }
  };

  const metrics = useMemo(() => {
    const upcomingMeetings = project.meetings.filter(
      (meeting) => new Date(meeting.scheduledAt).getTime() >= Date.now()
    ).length;
    const activeSprint = project.sprints.find((s) => s.status === 'ACTIVE');
    const shippedStories = project.stories.filter(
      (story) => story.stage === 'DONE'
    ).length;
    return {
      upcomingMeetings,
      activeSprintName: activeSprint?.name ?? 'No sprint active',
      shippedStories,
    };
  }, [project.meetings, project.sprints, project.stories]);

  return (
    <div className='space-y-6'>
      <ProjectStageHeader project={project}>
        <StageControls
          currentStage={project.stage}
          onSelect={(stage) => {
            void advanceStage(stage);
          }}
          disabled={stageUpdating}
        />
        {stageError && (
          <div className='rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm'>
            {stageError}
          </div>
        )}
      </ProjectStageHeader>
      <section className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(15,23,42,0.08)]'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Upcoming calls
          </p>
          <p className='text-3xl font-semibold text-slate-900'>
            {metrics.upcomingMeetings}
          </p>
          <p className='text-sm text-slate-500'>on the calendar</p>
        </div>
        <div className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(15,23,42,0.08)]'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Active sprint
          </p>
          <p className='text-lg font-semibold text-slate-900'>
            {metrics.activeSprintName}
          </p>
          <p className='text-sm text-slate-500'>
            Track the work from Planning/Active tabs
          </p>
        </div>
        <div className='rounded-3xl border border-white/80 bg-white p-5 shadow-[0_15px_35px_rgba(15,23,42,0.08)]'>
          <p className='text-xs uppercase tracking-wide text-slate-500'>
            Stories shipped
          </p>
          <p className='text-3xl font-semibold text-slate-900'>
            {metrics.shippedStories}
          </p>
          <p className='text-sm text-slate-500'>marked done to date</p>
        </div>
      </section>

      <section className='rounded-3xl border border-white/80 bg-white p-6 shadow-[0_15px_35px_rgba(15,23,42,0.08)]'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>
              Project Status
            </h2>
            <p className='text-sm text-slate-500'>
              Current status note visible to client
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleGenerateDraft}
              disabled={isGenerating || isSaving}
              className='rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50'
            >
              {isGenerating ? 'Generating...' : 'Auto-generate Draft'}
            </button>
            <button
              type='button'
              onClick={handleSaveStatus}
              disabled={isGenerating || isSaving}
              className='rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50'
            >
              {isSaving ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </div>
        <textarea
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          className='w-full h-40 rounded-xl border border-slate-200 p-4 text-sm text-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
          placeholder='Enter project status update...'
        />
      </section>
    </div>
  );
}
