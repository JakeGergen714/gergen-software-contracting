import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useServices } from '../../context/ServiceContext';
import { BusinessOverview } from '../../types/domain';
import { stageCopy, stageOrder } from '../../components/project/stageMeta';
import {
  Stack,
  Heading,
  Text,
  Kicker,
  Card,
  Tag,
  Button,
} from '../../components/ui/design-system';

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
        className='min-h-[40vh] flex items-center justify-center text-text-muted'
        data-testid='admin-loading'
      >
        Loading admin overview…
      </div>
    );
  }

  if (!session || !overview) {
    return (
      <div
        className='min-h-[40vh] flex items-center justify-center text-text-muted'
        data-testid='admin-empty-session'
      >
        Admin session not available.
      </div>
    );
  }

  return (
    <Stack data-testid='admin-workspace-layout'>
      <Helmet>
        <title>Admin workspace | Gergen Software</title>
      </Helmet>
      <Card className='p-8'>
        <Stack>
          <div>
            <Kicker>Delivery admin</Kicker>
            <Heading level='h1'>Portfolio overview</Heading>
            <Text variant='muted' className='mt-2 max-w-2xl'>
              Track every client project, approvals, and milestones in one
              place.
            </Text>
          </div>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4'>
            {stageStats.map((stat) => (
              <div
                key={stat.stage}
                className='bg-surface-alt rounded-xl border border-border-subtle px-5 py-4'
                data-testid={
                  stat.stage === 'REQUIREMENTS'
                    ? 'admin-stat-total-projects'
                    : stat.stage === 'PLANNING'
                    ? 'admin-stat-active-clients'
                    : undefined
                }
              >
                <Kicker className='mb-1'>{stat.label}</Kicker>
                <p className='text-3xl font-bold text-text-primary'>
                  {stat.count}
                </p>
              </div>
            ))}
          </div>
        </Stack>
      </Card>

      <div className='grid lg:grid-cols-3 gap-6'>
        <Stack className='lg:col-span-2'>
          <div className='flex items-center justify-between'>
            <div>
              <Heading level='h2'>Projects</Heading>
              <Text variant='small' className='text-text-muted'>
                Active engagements for {overview.business.name}.
              </Text>
            </div>
          </div>
          {projects.length > 0 ? (
            projects.map((proj) => (
              <Card
                key={proj.id}
                className='p-6 hover:shadow-md transition-all duration-200'
              >
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <Kicker>
                      {proj.approvalState.replace('_', ' ').toLowerCase()}
                    </Kicker>
                    <Heading level='h3' className='mt-1'>
                      {proj.name}
                    </Heading>
                    <Text variant='small' className='mt-1'>
                      {proj.description}
                    </Text>
                  </div>
                  <div className='text-right'>
                    <Tag variant='soft'>{stageCopy[proj.stage].title}</Tag>
                    <Text variant='small' className='mt-2 text-text-muted'>
                      Updated {new Date(proj.updatedAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>
                {proj.statusNote && (
                  <div className='mt-4 flex items-start gap-2 text-sm text-text-muted bg-surface-alt p-3 rounded-lg border border-border-subtle'>
                    <svg
                      className='w-4 h-4 mt-0.5 text-text-muted flex-shrink-0'
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
                  <Button asChild>
                    <Link to={`/admin/projects/${proj.id}`}>Manage</Link>
                  </Button>
                  <Button variant='outline' asChild>
                    <Link to={`/business/projects/${proj.id}`}>
                      View client page
                    </Link>
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className='border-dashed border-border-subtle p-12 text-center'>
              <div className='mx-auto h-12 w-12 text-text-muted mb-4'>
                <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
              <Heading level='h3' className='text-lg'>
                No projects yet
              </Heading>
              <Text variant='muted' className='mt-1'>
                Create one from the client dashboard to populate this view.
              </Text>
            </Card>
          )}
        </Stack>

        <Card className='p-6 h-fit sticky top-24'>
          <div className='mb-4'>
            <Heading level='h3' className='text-lg'>
              Recent updates
            </Heading>
            <Text variant='small' className='text-text-muted'>
              Last touched items for quick follow-up.
            </Text>
          </div>
          {recentlyTouched.length > 0 ? (
            <div className='space-y-3'>
              {recentlyTouched.map((proj) => (
                <div
                  key={proj.id}
                  className='group block rounded-xl border border-border-subtle bg-surface-alt p-3 hover:bg-surface hover:border-brand-soft hover:shadow-sm transition-all duration-200 cursor-pointer'
                >
                  <div className='flex items-center justify-between text-text-primary font-medium mb-1'>
                    <span className='group-hover:text-brand-solid transition-colors'>
                      {proj.name}
                    </span>
                    <Tag variant='outline' className='text-[10px] py-0.5'>
                      {stageCopy[proj.stage].title}
                    </Tag>
                  </div>
                  <Text variant='small' className='text-xs text-text-muted'>
                    Updated{' '}
                    {new Date(proj.updatedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </Text>
                </div>
              ))}
            </div>
          ) : (
            <Text variant='small' className='italic text-text-muted'>
              Nothing updated yet.
            </Text>
          )}
        </Card>
      </div>
    </Stack>
  );
}
