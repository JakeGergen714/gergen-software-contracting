import { useState, useEffect } from 'react';
import { useProjectWorkspace } from '../../project/ProjectLayoutBase';
import { useServices } from '../../../context/ServiceContext';
import {
  ChangeRequest,
  CreateChangeRequestInput,
  ChangeRequestStatus,
} from '../../../types/domain';
import { Modal } from '../../../components/ui/Modal';

const statusColors: Record<ChangeRequestStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

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

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-slate-900'>
            Change Requests
          </h2>
          <p className='text-sm text-slate-500'>
            Manage scope changes and approvals.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className='rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800'
        >
          New Request
        </button>
      </div>

      {loading ? (
        <div className='text-sm text-slate-500'>Loading...</div>
      ) : requests.length === 0 ? (
        <div className='rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500'>
          No change requests found.
        </div>
      ) : (
        <div className='grid gap-4'>
          {requests.map((req) => (
            <div
              key={req.id}
              className='rounded-xl border border-slate-200 bg-white p-5 shadow-sm'
            >
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <div className='flex items-center gap-3'>
                    <h3 className='font-semibold text-slate-900'>
                      {req.title}
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        statusColors[req.status]
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-slate-600'>
                    {req.description}
                  </p>
                  <div className='mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600'>
                    <span className='font-semibold uppercase tracking-wide text-slate-500'>
                      Impact Analysis:
                    </span>
                    <p className='mt-1'>{req.impact}</p>
                  </div>
                  <p className='mt-3 text-xs text-slate-400'>
                    Created {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className='flex flex-col gap-2'>
                  {req.status === 'DRAFT' && (
                    <button
                      onClick={() =>
                        handleStatusChange(req.id, 'PENDING_APPROVAL')
                      }
                      className='rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50'
                    >
                      Submit for Approval
                    </button>
                  )}
                  {req.status === 'PENDING_APPROVAL' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(req.id, 'APPROVED')}
                        className='rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700'
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(req.id, 'REJECTED')}
                        className='rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50'
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title='New Change Request'
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        actions={
          <>
            <button
              onClick={() => setCreateOpen(false)}
              className='rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700'
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving || !draft.title}
              className='rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50'
            >
              {saving ? 'Creating...' : 'Create Request'}
            </button>
          </>
        }
      >
        <form className='space-y-4'>
          {error && <div className='text-sm text-rose-600'>{error}</div>}
          <label className='block text-sm'>
            <span className='font-semibold text-slate-700'>Title</span>
            <input
              className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder='e.g. Add payment gateway support'
            />
          </label>
          <label className='block text-sm'>
            <span className='font-semibold text-slate-700'>Description</span>
            <textarea
              className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
              rows={3}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder='Describe the requested change...'
            />
          </label>
          <label className='block text-sm'>
            <span className='font-semibold text-slate-700'>
              Impact Analysis
            </span>
            <textarea
              className='mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm'
              rows={3}
              value={draft.impact}
              onChange={(e) => setDraft({ ...draft, impact: e.target.value })}
              placeholder='Cost, timeline, and risk implications...'
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
