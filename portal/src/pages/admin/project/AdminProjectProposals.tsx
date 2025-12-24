import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import { CreateProposalInput, Proposal } from '../../../types/domain';
import { Stack } from '../../../components/ui/container';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Tag } from '../../../components/ui/tag';
import { Loader2, Printer, Plus } from 'lucide-react';

export default function AdminProjectProposals() {
  const { projectId } = useParams<{ projectId: string }>();
  const { proposals } = useServices();
  const [list, setList] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateProposalInput>({
    content: '',
    pricing: '',
  });

  useEffect(() => {
    if (!projectId) return;
    proposals
      .listProposals(projectId)
      .then(setList)
      .finally(() => setLoading(false));
  }, [projectId, proposals]);

  const handleCreate = async () => {
    if (!projectId) return;
    try {
      const created = await proposals.createProposal(projectId, form);
      setList([created, ...list]);
      setCreating(false);
      setForm({ content: '', pricing: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create proposal');
    }
  };

  if (loading)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin text-brand-solid' />
      </div>
    );

  return (
    <Stack gap={6}>
      <div className='flex justify-between items-center no-print'>
        <Heading level='h2' className='text-xl font-semibold text-text-primary'>
          Proposals
        </Heading>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => window.print()}
            className='border-border-subtle text-text-primary hover:bg-surface-alt'
          >
            <Printer className='mr-2 h-4 w-4' />
            Print
          </Button>
          <Button
            onClick={() => setCreating(true)}
            className='bg-brand-solid hover:bg-brand-solid/90 text-white'
          >
            <Plus className='mr-2 h-4 w-4' />
            New Proposal
          </Button>
        </div>
      </div>

      {creating && (
        <Card className='bg-surface border-border-subtle'>
          <CardHeader>
            <Heading
              level='h3'
              className='font-semibold text-lg text-text-primary'
            >
              Draft New Proposal
            </Heading>
          </CardHeader>
          <CardContent>
            <Stack gap={4}>
              <div className='space-y-2'>
                <Text variant='label' className='text-text-secondary'>
                  Content (Markdown)
                </Text>
                <Textarea
                  rows={6}
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  className='bg-surface-alt border-border-subtle text-text-primary'
                />
              </div>
              <div className='space-y-2'>
                <Text variant='label' className='text-text-secondary'>
                  Pricing / Terms
                </Text>
                <Textarea
                  rows={4}
                  value={form.pricing}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pricing: e.target.value }))
                  }
                  className='bg-surface-alt border-border-subtle text-text-primary'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='ghost'
                  onClick={() => setCreating(false)}
                  className='text-text-muted hover:text-text-primary hover:bg-surface-alt'
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!form.content || !form.pricing}
                  className='bg-brand-solid hover:bg-brand-solid/90 text-white'
                >
                  Create Version
                </Button>
              </div>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Stack gap={4}>
        {list.map((p) => (
          <Card key={p.id} className='bg-surface border-border-subtle'>
            <CardContent className='pt-6'>
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <div className='flex items-center gap-2'>
                    <Text
                      variant='body'
                      className='font-semibold text-text-primary'
                    >
                      Version {p.version}
                    </Text>
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
                  </div>
                  <Text variant='caption' className='mt-1 text-text-muted'>
                    Created {new Date(p.createdAt).toLocaleDateString()}
                  </Text>
                </div>
              </div>
              <div className='prose prose-sm max-w-none text-text-muted mb-4'>
                <div className='whitespace-pre-wrap'>{p.content}</div>
              </div>
              <div className='bg-surface-alt p-4 rounded-xl text-sm border border-border-subtle'>
                <Text
                  variant='body'
                  className='font-medium mb-1 text-text-primary'
                >
                  Pricing & Terms
                </Text>
                <div className='whitespace-pre-wrap text-text-secondary'>
                  {p.pricing}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length === 0 && !creating && (
          <div className='text-center py-12 text-text-muted bg-surface-alt rounded-lg border border-dashed border-border-subtle'>
            <Text variant='muted'>No proposals created yet.</Text>
          </div>
        )}
      </Stack>
    </Stack>
  );
}
