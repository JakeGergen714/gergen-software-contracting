import { useState, useEffect } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';
import {
  ChangeRequest,
  CreateChangeRequestInput,
  ChangeRequestStatus,
} from '../../../types/domain';
import { Modal } from '../../../components/ui/Modal';
import { Stack } from '../../../components/ui/container';
import { Card, CardContent } from '../../../components/ui/card';
import { Heading, Text } from '../../../components/ui/typography';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Tag } from '../../../components/ui/tag';
import { Loader2, Plus } from 'lucide-react';

export default function AdminProjectChangeRequests() {
  const { project } = useProjectWorkspace();
  const { project: projectService } = useServices();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState<CreateChangeRequestInput>({
    title: '',
    description: '',
    impact: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, [project.id]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await projectService.getChangeRequests(project.id);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await projectService.createChangeRequest(project.id, draft);
      setCreateOpen(false);
      setDraft({ title: '', description: '', impact: '' });
      loadRequests();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create change request'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    requestId: string,
    status: ChangeRequestStatus
  ) => {
    try {
      await projectService.updateChangeRequestStatus(
        project.id,
        requestId,
        status
      );
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusVariant = (status: ChangeRequestStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING_APPROVAL':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <Stack gap={6}>
      <div className='flex items-center justify-between'>
        <div>
          <Heading
            level='h2'
            className='text-xl font-semibold text-text-primary'
          >
            Change Requests
          </Heading>
          <Text variant='muted' className='text-text-muted'>
            Manage scope changes and approvals.
          </Text>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className='bg-brand-solid hover:bg-brand-solid/90 text-white'
        >
          <Plus className='mr-2 h-4 w-4' />
          New Request
        </Button>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin text-brand-solid' />
        </div>
      ) : requests.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-border-subtle bg-surface-alt p-8 text-center text-sm text-text-muted'>
          No change requests found.
        </div>
      ) : (
        <Stack gap={4}>
          {requests.map((req) => (
            <Card key={req.id} className='bg-surface border-border-subtle'>
              <CardContent className='pt-6'>
                <div className='flex items-start justify-between gap-4'>
                  <Stack gap={2} className='flex-1'>
                    <div className='flex items-center gap-3'>
                      <Heading
                        level='h3'
                        className='font-semibold text-text-primary'
                      >
                        {req.title}
                      </Heading>
                      <Tag variant={getStatusVariant(req.status)}>
                        {req.status.replace('_', ' ')}
                      </Tag>
                    </div>
                    <Text variant='body' className='text-text-secondary'>
                      {req.description}
                    </Text>
                    <div className='mt-1 rounded-lg bg-surface-alt p-3 text-xs border border-border-subtle'>
                      <Text
                        variant='label'
                        className='uppercase tracking-wide text-text-muted'
                      >
                        Impact Analysis:
                      </Text>
                      <Text variant='body' className='mt-1 text-text-primary'>
                        {req.impact}
                      </Text>
                    </div>
                    <Text variant='caption' className='text-text-muted'>
                      Created {new Date(req.createdAt).toLocaleDateString()}
                    </Text>
                  </Stack>
                  <div className='flex flex-col gap-2'>
                    {req.status === 'DRAFT' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          handleStatusChange(req.id, 'PENDING_APPROVAL')
                        }
                        className='text-amber-700 border-amber-200 hover:bg-amber-50'
                      >
                        Submit for Approval
                      </Button>
                    )}
                    {req.status === 'PENDING_APPROVAL' && (
                      <>
                        <Button
                          size='sm'
                          onClick={() => handleStatusChange(req.id, 'APPROVED')}
                          className='bg-brand-solid hover:bg-brand-solid/90 text-white'
                        >
                          Approve
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleStatusChange(req.id, 'REJECTED')}
                          className='text-brand-strong border-brand-strong/20 hover:bg-brand-strong/5'
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Modal
        title='New Change Request'
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <Button
              variant='outline'
              onClick={() => setCreateOpen(false)}
              className='border-border-subtle text-text-primary hover:bg-surface-alt'
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !draft.title}
              className='bg-brand-solid hover:bg-brand-solid/90 text-white'
            >
              {saving ? 'Creating...' : 'Create Request'}
            </Button>
          </>
        }
      >
        <Stack gap={4}>
          {error && (
            <Text variant='body' className='text-brand-strong'>
              {error}
            </Text>
          )}
          <div className='space-y-2'>
            <Text variant='label' className='text-text-secondary'>
              Title
            </Text>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder='e.g. Add payment gateway support'
              className='bg-surface-alt border-border-subtle text-text-primary'
            />
          </div>
          <div className='space-y-2'>
            <Text variant='label' className='text-text-secondary'>
              Description
            </Text>
            <Textarea
              rows={3}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder='Describe the requested change...'
              className='bg-surface-alt border-border-subtle text-text-primary'
            />
          </div>
          <div className='space-y-2'>
            <Text variant='label' className='text-text-secondary'>
              Impact Analysis
            </Text>
            <Textarea
              rows={3}
              value={draft.impact}
              onChange={(e) => setDraft({ ...draft, impact: e.target.value })}
              placeholder='Cost, timeline, and risk implications...'
              className='bg-surface-alt border-border-subtle text-text-primary'
            />
          </div>
        </Stack>
      </Modal>
    </Stack>
  );
}
