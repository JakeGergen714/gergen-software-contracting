import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { Card } from '../../../components/ui/card';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';

export default function BusinessProjectOverview() {
  const { project } = useProjectWorkspace();

  return (
    <Card>
      <Stack gap={6}>
        <Stack gap={2}>
          <Text variant='eyebrow'>Project</Text>
          <Heading level='h2'>{project.name}</Heading>
          {project.description && (
            <Text variant='body' className='text-slate-600'>
              {project.description}
            </Text>
          )}
        </Stack>

        <div className='grid gap-4 sm:grid-cols-2'>
          <Stack gap={1}>
            <Text variant='eyebrow'>Status</Text>
            <Text variant='body' weight='medium'>
              {project.stage}
            </Text>
            {project.statusNote && (
              <Text variant='body' className='text-slate-600'>
                {project.statusNote}
              </Text>
            )}
          </Stack>
          <Stack gap={1}>
            <Text variant='eyebrow'>Basics</Text>
            <Text variant='body'>
              <span className='text-slate-500'>Kickoff:</span>{' '}
              {new Date(project.kickoffCallAt).toLocaleDateString()}
            </Text>
            <Text variant='body'>
              <span className='text-slate-500'>Last updated:</span>{' '}
              {new Date(project.updatedAt).toLocaleDateString()}
            </Text>
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}
