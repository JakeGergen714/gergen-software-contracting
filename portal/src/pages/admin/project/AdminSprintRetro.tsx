import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ProjectWorkspaceOutletContext } from '../../project/ProjectLayoutBase';
import { Stack } from '../../../components/ui/container';
import { Card } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { StatTile } from '../../../components/ui/StatTile';

export default function AdminSprintRetro() {
  const { project } = useOutletContext<ProjectWorkspaceOutletContext>();
  const stats = useMemo(() => {
    const done = project.stories.filter(
      (story) => story.stage === 'DONE'
    ).length;
    const total = project.stories.length || 1;
    return {
      done,
      predictability: Math.round((done / total) * 100),
      incidents: project.meetings.filter((m) => m.type === 'REVIEW').length,
    };
  }, [project.stories, project.meetings]);

  return (
    <Stack gap={6}>
      <section className='grid gap-4 md:grid-cols-3'>
        <StatTile
          label='Predictability'
          value={`${stats.predictability}%`}
          helper='of committed stories shipped'
          accent='neutral'
        />
        <StatTile
          label='Stories shipped'
          value={stats.done}
          helper='total this iteration'
          accent='neutral'
        />
        <StatTile
          label='Review sessions'
          value={stats.incidents}
          helper='action items captured'
          accent='neutral'
        />
      </section>

      <Card className='p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)]'>
        <Stack gap={4}>
          <div className='flex flex-col gap-2'>
            <Text variant='eyebrow' className='text-text-muted'>
              Retro talking points
            </Text>
            <Heading level='h3' className='text-xl'>
              What felt great · What felt rough
            </Heading>
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='rounded-2xl border border-brand-soft bg-brand-soft/50 p-4'>
              <Text variant='eyebrow' className='text-brand-solid'>
                Went well
              </Text>
              <ul className='mt-2 space-y-2 text-sm text-brand-solid'>
                <li>• Daily standups stayed under 10 minutes.</li>
                <li>• Monitoring caught 2 regressions before prod.</li>
                <li>• QA automation shaved a day off regression testing.</li>
              </ul>
            </div>
            <div className='rounded-2xl border border-amber-200 bg-amber-50 p-4'>
              <Text variant='eyebrow' className='text-amber-800'>
                Needs attention
              </Text>
              <ul className='mt-2 space-y-2 text-sm text-amber-900'>
                <li>• Acceptance criteria drifting late in sprint.</li>
                <li>• Review queue backed up mid-week.</li>
                <li>• Retro notes not published to Confluence.</li>
              </ul>
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
