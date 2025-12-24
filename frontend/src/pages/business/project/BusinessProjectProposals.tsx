import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import { Proposal } from '../../../types/domain';
import { Card } from '../../../components/ui/card';
import { Stack } from '../../../components/ui/container';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Tag } from '../../../components/ui/tag';

export default function BusinessProjectProposals() {
  const { projectId } = useParams<{ projectId: string }>();
  const { proposals } = useServices();
  const [list, setList] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    proposals
      .listProposals(projectId)
      .then(setList)
      .finally(() => setLoading(false));
  }, [projectId, proposals]);

  const handleStatus = async (
    proposalId: string,
    status: 'APPROVED' | 'REJECTED'
  ) => {
    if (!projectId) return;
    if (
      !confirm(
        `Are you sure you want to ${status.toLowerCase()} this proposal?`
      )
    )
      return;
    try {
      const updated = await proposals.updateStatus(
        projectId,
        proposalId,
        status
      );
      setList(list.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  if (loading)
    return (
      <div className='p-8 text-center text-slate-500'>Loading proposals...</div>
    );

  // Show only non-draft proposals to client? Or all?
  // Usually clients shouldn't see DRAFT.
  const visibleProposals = list.filter((p) => p.status !== 'DRAFT');

  return (
    <Stack gap={6}>
      <Stack
        direction='row'
        justify='between'
        align='center'
        className='no-print'
      >
        <Heading level='h2'>Proposals & Agreements</Heading>
        <Button variant='ghost' onClick={() => window.print()}>
          Print
        </Button>
      </Stack>

      <Stack gap={4}>
        {visibleProposals.map((p) => (
          <Card key={p.id} className='hover:shadow-sm transition-shadow'>
            <Stack gap={4}>
              <Stack direction='row' justify='between' align='start'>
                <Stack gap={1}>
                  <Stack direction='row' align='center' gap={2}>
                    <Text weight='semibold'>Version {p.version}</Text>
                    <Tag
                      variant={
                        p.status === 'APPROVED'
                          ? 'success'
                          : p.status === 'REJECTED'
                          ? 'error'
                          : p.status === 'SUPERSEDED'
                          ? 'neutral'
                          : 'warning'
                      }
                    >
                      {p.status}
                    </Tag>
                  </Stack>
                  <Text variant='caption' className='text-slate-500'>
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </Text>
                </Stack>
                {p.status === 'REVIEW' && (
                  <Stack direction='row' gap={2}>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleStatus(p.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => handleStatus(p.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  </Stack>
                )}
              </Stack>
              <div className='prose prose-sm max-w-none text-slate-600'>
                <div className='whitespace-pre-wrap'>{p.content}</div>
              </div>
              <div className='bg-slate-50 p-4 rounded-xl text-sm text-slate-700'>
                <div className='font-medium mb-1'>Pricing & Terms</div>
                <div className='whitespace-pre-wrap'>{p.pricing}</div>
              </div>
            </Stack>
          </Card>
        ))}
        {visibleProposals.length === 0 && (
          <div className='text-center py-12 text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
            No proposals available for review.
          </div>
        )}
      </Stack>
    </Stack>
  );
}
