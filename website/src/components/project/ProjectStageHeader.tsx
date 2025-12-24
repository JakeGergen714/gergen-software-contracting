import { ReactNode, useMemo } from 'react';
import { ProjectDetail } from '../../types/domain';
import { stageCopy, stageOrder } from './stageMeta';
import { Card } from '../ui/card';
import { Stack } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { Tag } from '../ui/tag';

interface ProjectStageHeaderProps {
  project: ProjectDetail;
  children?: ReactNode;
}

export function ProjectStageHeader({
  project,
  children,
}: ProjectStageHeaderProps) {
  const currentStageIdx = useMemo(
    () => stageOrder.indexOf(project.stage),
    [project.stage]
  );

  return (
    <Card>
      <Stack gap={6}>
        <Stack gap={2}>
          <Text variant='eyebrow'>Project</Text>
          <Heading level='h2'>{project.name}</Heading>
          <Text variant='body' className='text-text-secondary'>
            {project.description}
          </Text>
        </Stack>
        <Stack gap={4}>
          <Stack direction='row' align='center' gap={3}>
            <Text variant='label'>Stage</Text>
            <Tag variant='neutral'>{stageCopy[project.stage].title}</Tag>
          </Stack>
          <div className='flex gap-2'>
            {stageOrder.map((stage, idx) => (
              <div key={stage} className='flex-1 flex items-center'>
                <div
                  className={`h-2 flex-1 rounded-full ${
                    idx <= currentStageIdx ? 'bg-brand-solid' : 'bg-stone-200'
                  }`}
                />
                {idx < stageOrder.length - 1 && (
                  <div className='w-2 h-2' aria-hidden />
                )}
              </div>
            ))}
          </div>
          <Text variant='small' className='text-text-muted'>
            {stageCopy[project.stage].blurb}
          </Text>
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}
