import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useServices } from '../../context/ServiceContext';
import { PortfolioDashboard } from '../../types/domain';
import {
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaProjectDiagram,
  FaDownload,
} from 'react-icons/fa';

export default function AdminPortfolioDashboard() {
  const { session } = useAuthContext();
  const { business, reports } = useServices();
  const [dashboard, setDashboard] = useState<PortfolioDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!session) return;
    let mounted = true;
    business
      .getPortfolioDashboard(session.business.id)
      .then((data) => {
        if (mounted) setDashboard(data);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [business, session]);

  const handleExport = async () => {
    if (!session) return;
    setExporting(true);
    try {
      await reports.downloadPortfolioCsv(session.business.id);
    } catch (error) {
      console.error('Failed to export portfolio:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-[40vh] flex items-center justify-center text-text-muted'>
        Loading portfolio dashboard...
      </div>
    );
  }

  if (!session || !dashboard) {
    return (
      <div className='min-h-[40vh] flex items-center justify-center text-text-muted'>
        Portfolio data not available.
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <Helmet>
        <title>Portfolio Dashboard | Gergen Software</title>
      </Helmet>

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-semibold text-text-primary'>
            Portfolio Dashboard
          </h1>
          <p className='text-text-muted mt-1'>
            High-level view of all projects.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className='flex items-center gap-2 px-4 py-2 bg-surface border border-border-subtle rounded-lg text-text-secondary hover:bg-surface-alt hover:text-text-primary transition-colors disabled:opacity-50'
        >
          <FaDownload size={14} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-surface border border-border-subtle p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-brand-soft text-brand-solid rounded-xl'>
            <FaProjectDiagram size={24} />
          </div>
          <div>
            <p className='text-sm text-text-muted font-medium'>
              Active Projects
            </p>
            <p className='text-2xl font-bold text-text-primary'>
              {dashboard.activeProjects}
            </p>
          </div>
        </div>

        <div className='bg-surface border border-border-subtle p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-stone-100 text-stone-600 rounded-xl'>
            <FaCheckCircle size={24} />
          </div>
          <div>
            <p className='text-sm text-text-muted font-medium'>
              Completed Points
            </p>
            <p className='text-2xl font-bold text-text-primary'>
              {dashboard.completedPoints} / {dashboard.totalPoints}
            </p>
          </div>
        </div>

        <div className='bg-surface border border-border-subtle p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-brand-soft text-brand-solid rounded-xl'>
            <FaChartLine size={24} />
          </div>
          <div>
            <p className='text-sm text-text-muted font-medium'>
              Overall Velocity
            </p>
            <p className='text-2xl font-bold text-text-primary'>
              {dashboard.overallVelocity.toFixed(1)} pts/sprint
            </p>
          </div>
        </div>

        <div className='bg-surface border border-border-subtle p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-brand-strong/10 text-brand-strong rounded-xl'>
            <FaExclamationTriangle size={24} />
          </div>
          <div>
            <p className='text-sm text-text-muted font-medium'>High Risks</p>
            <p className='text-2xl font-bold text-text-primary'>
              {dashboard.riskSummary['HIGH'] || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className='bg-surface border border-border-subtle rounded-3xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-border-subtle'>
          <h2 className='text-lg font-semibold text-text-primary'>
            Project Performance
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-surface-alt text-text-muted font-medium'>
              <tr>
                <th className='px-6 py-3'>Project Name</th>
                <th className='px-6 py-3'>Stage</th>
                <th className='px-6 py-3'>Health</th>
                <th className='px-6 py-3'>Progress</th>
                <th className='px-6 py-3'>Active Risks</th>
                <th className='px-6 py-3'>Points (Done/Total)</th>
                <th className='px-6 py-3'></th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border-subtle'>
              {dashboard.projects.map((project) => (
                <tr key={project.id} className='hover:bg-surface-alt/50'>
                  <td className='px-6 py-4 font-medium text-text-primary'>
                    {project.name}
                  </td>
                  <td className='px-6 py-4'>
                    <span className='px-2 py-1 rounded-full bg-surface-alt text-text-secondary text-xs font-medium border border-border-subtle'>
                      {project.stage}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.health === 'Critical'
                          ? 'bg-brand-strong/10 text-brand-strong'
                          : project.health === 'At Risk'
                          ? 'bg-amber-500/10 text-amber-700'
                          : 'bg-brand-soft text-brand-solid'
                      }`}
                    >
                      {project.health}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-24 h-2 bg-surface-alt rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-brand-solid rounded-full'
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className='text-xs text-text-muted'>
                        {Math.round(project.progress)}%
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-text-primary'>
                    {project.activeRisks}
                  </td>
                  <td className='px-6 py-4 text-text-primary'>
                    {project.completedPoints} / {project.totalPoints}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      to={`/admin/projects/${project.id}`}
                      className='text-brand-solid hover:text-brand-solid/80 font-medium text-xs'
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
