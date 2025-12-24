import { ProjectStage } from '../../types/domain';

export const stageOrder: ProjectStage[] = [
  'REQUIREMENTS',
  'PLANNING',
  'EXECUTION',
  'MAINTAINING',
];

export const stageCopy: Record<ProjectStage, { title: string; blurb: string }> = {
  REQUIREMENTS: {
    title: 'Requirements',
    blurb: 'Capture context, goals, and schedule intake conversations.',
  },
  PLANNING: {
    title: 'Planning',
    blurb: 'Shape epics, build backlog slices, prep the roadmap for approval.',
  },
  EXECUTION: {
    title: 'Execution',
    blurb: 'Sprint delivery, show progress by epic, keep the board fresh.',
  },
  MAINTAINING: {
    title: 'Maintaining',
    blurb: 'Post-launch polish, monitoring, and ops support.',
  },
};
