import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import { Story, StoryStage } from '../../../types/domain';
import { Card } from '../../../components/ui/card';

const STAGES: StoryStage[] = [
  'BACKLOG',
  'READY',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
];

const WIP_LIMITS: Record<StoryStage, number> = {
  BACKLOG: 100,
  READY: 10,
  IN_PROGRESS: 5,
  IN_REVIEW: 5,
  DONE: 100,
};

export const AdminProjectKanban: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project: projectService } = useServices();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const project = await projectService.getProject(projectId);
      setStories(project.stories);
    } catch (error) {
      console.error('Failed to load project stories', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!draggedStoryId || !projectId) return;

    const story = stories.find((s) => s.id === draggedStoryId);
    if (!story || story.stage === stage) return;

    // Optimistic update
    const updatedStories = stories.map((s) =>
      s.id === draggedStoryId ? { ...s, stage } : s
    );
    setStories(updatedStories);
    setDraggedStoryId(null);

    try {
      await projectService.updateStoryStage(projectId, draggedStoryId, stage);
    } catch (error) {
      console.error('Failed to update story stage', error);
      // Revert on failure
      loadData();
    }
  };

  if (loading) return <div>Loading board...</div>;

  const getStoriesByStage = (stage: StoryStage) =>
    stories.filter((s) => s.stage === stage);

  return (
    <div className='h-full overflow-x-auto'>
      <div className='flex h-full space-x-4 min-w-max pb-4'>
        {STAGES.map((stage) => {
          const stageStories = getStoriesByStage(stage);
          const isOverLimit = stageStories.length > WIP_LIMITS[stage];

          return (
            <div
              key={stage}
              className='flex flex-col w-80 bg-slate-100 rounded-lg p-4'
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className='flex justify-between items-center mb-4'>
                <h3 className='font-semibold text-slate-700'>
                  {stage.replace('_', ' ')}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isOverLimit
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {stageStories.length} / {WIP_LIMITS[stage]}
                </span>
              </div>

              <div className='flex-1 overflow-y-auto space-y-3 min-h-[200px]'>
                {stageStories.map((story) => (
                  <div
                    key={story.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, story.id)}
                    className='cursor-move'
                  >
                    <Card className='p-3 hover:shadow-md transition-shadow bg-white'>
                      <div className='text-sm font-medium text-slate-900 mb-1'>
                        {story.title}
                      </div>
                      {story.points && (
                        <div className='text-xs text-slate-500 mb-2'>
                          {story.points} pts
                        </div>
                      )}
                      <div className='flex flex-wrap gap-1'>
                        {story.tags?.map((tag) => (
                          <span
                            key={tag.id}
                            className='text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded'
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
  );
};
