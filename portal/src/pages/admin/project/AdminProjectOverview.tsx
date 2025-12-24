import { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceOutletContext } from '../../project/ProjectLayoutBase';
import { ProjectStageHeader } from '../../../components/project/ProjectStageHeader';
import { StageControls } from '../../../components/project/StageControls';
import { useServices } from '../../../context/ServiceContext';
import { StatusNoteHistory } from '../../../components/project/StatusNoteHistory';
import { EpicStatus, StatusNoteVersion } from '../../../types/domain';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Stack } from '../../../components/ui/container';
import { Card } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';

const attentionStatuses: EpicStatus[] = ['AWAITING_APPROVAL', 'IN_PROGRESS'];

export default function AdminProjectOverview() {
  const { project, setProject, advanceStage, stageUpdating, stageError } =
    useOutletContext<ProjectWorkspaceOutletContext>();
  const { project: projectService } = useServices();

  const [statusNote, setStatusNote] = useState(project.statusNote || '');
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<StatusNoteVersion[]>([]);

  useEffect(() => {
    setStatusNote(project.statusNote || '');
  }, [project.statusNote]);

  useEffect(() => {
    projectService
      .getStatusNoteHistory(project.id)
      .then(setHistory)
      .catch(console.error);
  }, [project.id, projectService]);

  const handleSaveStatus = async () => {
    setIsSaving(true);
    try {
      const updated = await projectService.updateStatusNote(
        project.id,
        statusNote
      );
      setProject(updated);
      const newHistory = await projectService.getStatusNoteHistory(project.id);
      setHistory(newHistory);
    } catch (error) {
      console.error('Failed to save status note', error);
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

  const riskItems = useMemo(() => {
    return project.epics
      .filter((epic) => attentionStatuses.includes(epic.status))
      .map((epic) => ({
        id: epic.id,
        name: epic.name,
        status: epic.status,
      }));
  }, [project.epics]);

  const orphanedStories = useMemo(() => {
    return project.stories.filter(
      (story) =>
        (story.stage === 'READY' || story.stage === 'DONE') && !story.sprintId
    );
  }, [project.stories]);

  return (
    <Stack gap={8}>
      <ProjectStageHeader project={project}>
        <StageControls
          currentStage={project.stage}
          onSelect={(stage) => {
            void advanceStage(stage);
          }}
          disabled={stageUpdating}
        />
        {stageError && (
          <div className='rounded-2xl border border-brand-strong/20 bg-brand-strong/5 text-brand-strong px-4 py-3 text-sm'>
            {stageError}
          </div>
        )}
      </ProjectStageHeader>
      <section className='grid gap-4 md:grid-cols-3'>
        <Card>
          <Stack gap={1}>
            <Text variant='eyebrow'>Upcoming calls</Text>
            <Text className='text-3xl font-semibold text-text-primary'>
              {metrics.upcomingMeetings}
            </Text>
            <Text variant='small' className='text-text-muted'>
              on the calendar
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack gap={1}>
            <Text variant='eyebrow'>Active sprint</Text>
            <Text className='text-lg font-semibold text-text-primary'>
              {metrics.activeSprintName}
            </Text>
            <Text variant='small' className='text-text-muted'>
              Track the work from Planning/Active tabs
            </Text>
          </Stack>
        </Card>
        <Card>
          <Stack gap={1}>
            <Text variant='eyebrow'>Stories shipped</Text>
            <Text className='text-3xl font-semibold text-text-primary'>
              {metrics.shippedStories}
            </Text>
            <Text variant='small' className='text-text-muted'>
              marked done to date
            </Text>
          </Stack>
        </Card>
      </section>

      <div className='grid gap-8 lg:grid-cols-2'>
        <Stack gap={4}>
          <div className='flex items-center justify-between'>
            <Heading level='h3' className='text-lg'>
              Status Note
            </Heading>
            <div className='flex gap-2'>
              <Button size='sm' onClick={handleSaveStatus} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Update'}
              </Button>
            </div>
          </div>
          <Textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            className='h-48'
            placeholder='Write a status update for the client...'
          />
          <StatusNoteHistory versions={history} />
        </Stack>

        <Stack gap={6}>
          <div>
            <Heading level='h3' className='text-lg mb-4'>
              Attention Items
            </Heading>
            <Stack gap={3}>
              {riskItems.length === 0 && orphanedStories.length === 0 && (
                <div className='rounded-2xl border border-border-subtle bg-surface-alt p-4 text-center text-sm text-text-muted'>
                  <CheckCircle className='mx-auto mb-2 text-brand-solid h-5 w-5' />
                  No immediate attention items.
                </div>
              )}

              {riskItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4'
                >
                  <div className='flex items-center gap-3'>
                    <AlertTriangle className='text-amber-600 h-5 w-5' />
                    <div>
                      <Text weight='medium' className='text-amber-900'>
                        {item.name}
                      </Text>
                      <Text variant='caption' className='text-amber-700'>
                        Epic Status: {item.status}
                      </Text>
                    </div>
                  </div>
                </div>
              ))}

              {orphanedStories.map((story) => (
                <Card
                  key={story.id}
                  className='flex items-center justify-between p-4'
                >
                  <div className='flex items-center gap-3'>
                    <Clock className='text-text-muted h-5 w-5' />
                    <div>
                      <Text weight='medium' className='text-text-primary'>
                        {story.title}
                      </Text>
                      <Text variant='caption' className='text-text-muted'>
                        {story.stage} but not in a sprint
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </Stack>
          </div>
        </Stack>
      </div>
    </Stack>
  );
}
