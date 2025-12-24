import React, { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import { StoryStage } from '../../../types/domain';
import { ProjectWorkspaceOutletContext } from '../../project/ProjectLayoutBase';
import { useDomainModal } from '../../../components/domain/DomainModalProvider';
import { Card } from '../../../components/ui/card';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Download } from 'lucide-react';

const STAGES: StoryStage[] = ['READY', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

const WIP_LIMITS: Record<StoryStage, number> = {
  BACKLOG: 100,
  READY: 10,
  IN_PROGRESS: 5,
  IN_REVIEW: 5,
  DONE: 100,
};

export default function AdminSprintActive() {
  const { project, setProject } =
    useOutletContext<ProjectWorkspaceOutletContext>();
  const { project: projectService, reports } = useServices();
  const { openStory } = useDomainModal();
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const activeSprint = useMemo(
    () => project.sprints.find((sprint) => sprint.status === 'ACTIVE'),
    [project.sprints]
  );

  const sprintStories = useMemo(
    () =>
      project.stories.filter((story) =>
        activeSprint ? story.sprintId === activeSprint.id : false
      ),
    [project.stories, activeSprint]
  );

  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    setDraggedStoryId(storyId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stage: StoryStage) => {
    e.preventDefault();
    if (!draggedStoryId || !activeSprint) return;

    const story = sprintStories.find((s) => s.id === draggedStoryId);
    if (!story || story.stage === stage) return;

    try {
      const updated = await projectService.updateStory(
        project.id,
        draggedStoryId,
        {
          epicId: story.epicId,
          title: story.title,
          description: story.description,
          acceptanceCriteria: story.acceptanceCriteria,
          points: story.points,
          sprintId: story.sprintId ?? null,
          stage: stage,
          planningOrder: story.planningOrder ?? null,
        }
      );
      setProject(updated);
    } catch (err) {
      console.error('Failed to update story stage', err);
      setError('Failed to update story stage');
    } finally {
      setDraggedStoryId(null);
    }
  };

  const handleExport = async () => {
    if (!activeSprint) return;
    setExporting(true);
    try {
      await reports.downloadSprintCsv(project.id, activeSprint.id);
    } catch (error) {
      console.error('Failed to export sprint:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!activeSprint) {
    return (
      <div className='rounded-3xl border border-dashed border-border-subtle bg-surface px-6 py-10 text-center text-sm text-text-muted'>
        No active sprint. Kick one off from the Planning tab to start tracking.
      </div>
    );
  }

  const getStoriesByStage = (stage: StoryStage) =>
    sprintStories.filter((s) => s.stage === stage);

  return (
    <Stack gap={6} className='h-full'>
      {error && (
        <div className='rounded-2xl border border-brand-strong/20 bg-brand-strong/5 text-brand-strong px-4 py-2 text-sm'>
          {error}
        </div>
      )}

      <div className='flex justify-end'>
        <Button
          variant='ghost'
          onClick={handleExport}
          disabled={exporting}
          className='gap-2'
        >
          <Download className='h-4 w-4' />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      <div className='h-full overflow-x-auto'>
        <div className='flex h-full space-x-4 min-w-max pb-4'>
          {STAGES.map((stage) => {
            const stageStories = getStoriesByStage(stage);
            const isOverLimit = stageStories.length > WIP_LIMITS[stage];

            return (
              <div
                key={stage}
                className='flex flex-col w-80 bg-surface-raised rounded-lg p-4'
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage)}
              >
                <div className='flex justify-between items-center mb-4'>
                  <Heading level='h3' className='text-text-primary'>
                    {stage.replace('_', ' ')}
                  </Heading>
                  <Badge variant={isOverLimit ? 'destructive' : 'secondary'}>
                    {stageStories.length} / {WIP_LIMITS[stage]}
                  </Badge>
                </div>

                <div className='flex-1 overflow-y-auto space-y-3 min-h-[200px]'>
                  {stageStories.map((story) => (
                    <div
                      key={story.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, story.id)}
                      className='cursor-move'
                    >
                      <Card
                        className='p-3 hover:shadow-md transition-shadow bg-surface cursor-pointer'
                        onClick={() => openStory(story.id)}
                      >
                        <Text
                          weight='medium'
                          className='text-text-primary mb-1'
                        >
                          {story.title}
                        </Text>
                        {story.points && (
                          <Text
                            variant='caption'
                            className='text-text-muted mb-2'
                          >
                            {story.points} pts
                          </Text>
                        )}
                        <div className='flex flex-wrap gap-1'>
                          {story.tags?.map((tag) => (
                            <span
                              key={tag.id}
                              className='text-[10px] px-1.5 py-0.5 bg-brand-soft text-brand-strong rounded'
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Stack>
  );
}
