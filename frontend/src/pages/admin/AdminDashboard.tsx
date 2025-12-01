import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useServices } from '../../context/ServiceContext';
import { BusinessOverview } from '../../types/domain';
import { stageCopy, stageOrder } from '../../components/project/stageMeta';

export default function AdminDashboard() {
  const { session } = useAuthContext();
  const { business } = useServices();
  const [overview, setOverview] = useState<BusinessOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let mounted = true;
    business
      .getOverview(session.business.id)
      .then((data) => {
        if (mounted) setOverview(data);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [business, session]);

  const projects = overview?.projects ?? [];

  const stageStats = useMemo(() => {
    return stageOrder.map((stage) => ({
      stage,
      label: stageCopy[stage].title,
      count: projects.filter((proj) => proj.stage === stage).length,
    }));
  }, [projects]);

  const recentlyTouched = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 3);
  }, [projects]);

  if (loading) {
    return (
      <div
        className='min-h-[40vh] flex items-center justify-center text-slate-500'
        data-testid='admin-loading'
      >
        Loading admin overview…
      </div>
    );
  }

  if (!session || !overview) {
    return (
      <div
        className='min-h-[40vh] flex items-center justify-center text-slate-500'
        data-testid='admin-empty-session'
      >
        Admin session not available.
      </div>
    );
  }

  return (
    <div className='space-y-8' data-testid='admin-workspace-layout'>
      <Helmet>
        <title>Admin workspace | Gergen Software</title>
      </Helmet>
      <section className='bg-white rounded-2xl border border-slate-200 p-8 shadow-sm'>
        <div className='flex flex-col gap-4'>
          <div>
            <p className='text-xs uppercase tracking-wider text-slate-500 font-bold mb-1'>
              Delivery admin
            </p>
            <h1 className='text-3xl font-display font-bold text-slate-900'>
              Portfolio overview
            </h1>
            <p className='text-slate-600 mt-2 max-w-2xl'>
              Track every client project, approvals, and milestones in one
              place.
            </p>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
            {stageStats.map((stat) => (
              <div
                key={stat.stage}
                className='bg-slate-50 rounded-xl border border-slate-200 px-5 py-4'
                data-testid={
                  stat.stage === 'REQUIREMENTS'
                    ? 'admin-stat-total-projects'
                    : stat.stage === 'PLANNING'
                    ? 'admin-stat-active-clients'
                    : undefined
                }
              >
                <p className='text-xs uppercase text-slate-500 tracking-wide font-semibold mb-1'>
                  {stat.label}
                </p>
                <p className='text-3xl font-bold text-slate-900'>
                  {stat.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className='grid lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-display font-semibold text-slate-900'>
                Projects
              </h2>
              <p className='text-sm text-slate-500'>
                Active engagements for {overview.business.name}.
              </p>
            </div>
          </div>
          {projects.length > 0 ? (
            projects.map((proj) => (
              <div
                key={proj.id}
                className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200'
              >
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs uppercase text-slate-500 tracking-wide font-bold mb-1'>
                      {proj.approvalState.replace('_', ' ').toLowerCase()}
                    </p>
                    <h3 className='text-xl font-display font-semibold text-slate-900'>
                      {proj.name}
                    </h3>
                    <p className='text-sm text-slate-600 mt-1'>
                      {proj.description}
                    </p>
                  </div>
                  <div className='text-right'>
                    <span className='text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100'>
                      {stageCopy[proj.stage].title}
                    </span>
                    <p className='text-xs text-slate-400 mt-2'>
                      Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {proj.statusNote && (
                  <div className='mt-4 flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100'>
                    <svg
                      className='w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    {proj.statusNote}
                  </div>
                )}
                <div className='flex flex-wrap gap-3 mt-5 text-sm'>
                  <Link
                    to={`/admin/projects/${proj.id}`}
                    className='inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-white font-semibold hover:bg-slate-800 transition-colors shadow-sm'
                  >
                    Manage
                  </Link>
                  <Link
                    to={`/business/projects/${proj.id}`}
                    className='inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors'
                  >
                    View client page
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className='bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center'>
              <div className='mx-auto h-12 w-12 text-slate-300 mb-4'>
                <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-slate-900'>
                No projects yet
              </h3>
              <p className='mt-1 text-slate-500'>
                Create one from the client dashboard to populate this view.
              </p>
            </div>
          )}
        </div>

        <div className='bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit sticky top-24'>
          <div className='mb-4'>
            <h3 className='text-lg font-display font-semibold text-slate-900'>
              Recent updates
            </h3>
            <p className='text-sm text-slate-500'>
              Last touched items for quick follow-up.
            </p>
          </div>
          {recentlyTouched.length > 0 ? (
            <div className='space-y-3'>
              {recentlyTouched.map((proj) => (
                <div
                  key={proj.id}
                  className='group block rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer'
                >
                  <div className='flex items-center justify-between text-slate-900 font-medium mb-1'>
                    <span className='group-hover:text-blue-700 transition-colors'>
                      {proj.name}
                    </span>
                    <span className='text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500'>
                      {stageCopy[proj.stage].title}
                    </span>
                  </div>
                  <p className='text-xs text-slate-500'>
                    Updated{' '}
                    {new Date(proj.updatedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-slate-500 italic'>
              Nothing updated yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
