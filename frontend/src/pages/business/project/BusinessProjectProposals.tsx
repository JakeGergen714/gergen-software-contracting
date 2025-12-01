import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import { Proposal } from '../../../types/domain';

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
    <div className='space-y-6'>
      <div className='flex justify-between items-center no-print'>
        <h2 className='text-xl font-semibold text-slate-900'>
          Proposals & Agreements
        </h2>
        <button
          onClick={() => window.print()}
          className='text-slate-600 px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-full'
        >
          Print
        </button>
      </div>

      <div className='space-y-4'>
        {visibleProposals.map((p) => (
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
              {p.status === 'REVIEW' && (
                <div className='flex gap-2'>
                  <button
                    onClick={() => handleStatus(p.id, 'REJECTED')}
                    className='px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 rounded-full hover:bg-rose-100'
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatus(p.id, 'APPROVED')}
                    className='px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100'
                  >
                    Approve
                  </button>
                </div>
              )}
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
        {visibleProposals.length === 0 && (
          <div className='text-center py-12 text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
            No proposals available for review.
          </div>
        )}
      </div>
    </div>
  );
}
