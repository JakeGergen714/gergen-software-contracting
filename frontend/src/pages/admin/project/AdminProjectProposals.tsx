import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import { CreateProposalInput, Proposal } from '../../../types/domain';

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
      <div className='p-8 text-center text-slate-500'>Loading proposals...</div>
    );

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center no-print'>
        <h2 className='text-xl font-semibold text-slate-900'>Proposals</h2>
        <div className='flex gap-2'>
          <button
            onClick={() => window.print()}
            className='text-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-full'
          >
            Print
          </button>
          <button
            onClick={() => setCreating(true)}
            className='bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-semibold'
          >
            New Proposal
          </button>
        </div>
      </div>

      {creating && (
        <div className='surface-card p-6 rounded-3xl space-y-4 border border-slate-200'>
          <h3 className='font-semibold text-lg'>Draft New Proposal</h3>
          <label className='block'>
            <span className='text-sm text-slate-600'>Content (Markdown)</span>
            <textarea
              className='w-full mt-1 p-3 rounded-xl border border-slate-200'
              rows={6}
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
            />
          </label>
          <label className='block'>
            <span className='text-sm text-slate-600'>Pricing / Terms</span>
            <textarea
              className='w-full mt-1 p-3 rounded-xl border border-slate-200'
              rows={4}
              value={form.pricing}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricing: e.target.value }))
              }
            />
          </label>
          <div className='flex justify-end gap-2'>
            <button
              onClick={() => setCreating(false)}
              className='px-4 py-2 text-slate-600 font-medium'
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!form.content || !form.pricing}
              className='bg-slate-900 text-white px-6 py-2 rounded-full font-semibold disabled:opacity-50'
            >
              Create Version
            </button>
          </div>
        </div>
      )}

      <div className='space-y-4'>
        {list.map((p) => (
          <div
            key={p.id}
            className='surface-card p-6 rounded-3xl border border-slate-100 hover:shadow-sm transition-shadow'
          >
            <div className='flex justify-between items-start mb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-slate-900'>
                    Version {p.version}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-700'
                        : p.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-700'
                        : p.status === 'SUPERSEDED'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className='text-xs text-slate-500 mt-1'>
                  Created {new Date(p.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className='prose prose-sm max-w-none text-slate-600 mb-4'>
              <div className='whitespace-pre-wrap'>{p.content}</div>
            </div>
            <div className='bg-slate-50 p-4 rounded-xl text-sm text-slate-700'>
              <div className='font-medium mb-1'>Pricing & Terms</div>
              <div className='whitespace-pre-wrap'>{p.pricing}</div>
            </div>
          </div>
        ))}
        {list.length === 0 && !creating && (
          <div className='text-center py-12 text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
            No proposals created yet.
          </div>
        )}
      </div>
    </div>
  );
}
