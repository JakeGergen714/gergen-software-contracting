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
      <div className='min-h-[40vh] flex items-center justify-center text-slate-500'>
        Loading portfolio dashboard...
      </div>
    );
  }

  if (!session || !dashboard) {
    return (
      <div className='min-h-[40vh] flex items-center justify-center text-slate-500'>
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
          <h1 className='text-3xl font-semibold text-slate-900'>
            Portfolio Dashboard
          </h1>
          <p className='text-slate-600 mt-1'>
            High-level view of all projects and performance metrics.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className='flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50'
        >
          <FaDownload size={14} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='surface-card p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-blue-100 text-blue-600 rounded-xl'>
            <FaProjectDiagram size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 font-medium'>
              Active Projects
            </p>
            <p className='text-2xl font-bold text-slate-900'>
              {dashboard.activeProjects}
            </p>
          </div>
        </div>

        <div className='surface-card p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-green-100 text-green-600 rounded-xl'>
            <FaCheckCircle size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 font-medium'>
              Completed Points
            </p>
            <p className='text-2xl font-bold text-slate-900'>
              {dashboard.completedPoints} / {dashboard.totalPoints}
            </p>
          </div>
        </div>

        <div className='surface-card p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-purple-100 text-purple-600 rounded-xl'>
            <FaChartLine size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 font-medium'>
              Overall Velocity
            </p>
            <p className='text-2xl font-bold text-slate-900'>
              {dashboard.overallVelocity.toFixed(1)} pts/sprint
            </p>
          </div>
        </div>

        <div className='surface-card p-6 rounded-2xl flex items-center gap-4'>
          <div className='p-3 bg-red-100 text-red-600 rounded-xl'>
            <FaExclamationTriangle size={24} />
          </div>
          <div>
            <p className='text-sm text-slate-500 font-medium'>High Risks</p>
            <p className='text-2xl font-bold text-slate-900'>
              {dashboard.riskSummary['HIGH'] || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className='surface-card rounded-3xl overflow-hidden'>
        <div className='px-6 py-4 border-b border-slate-100'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Project Performance
          </h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-slate-50 text-slate-500 font-medium'>
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
            <tbody className='divide-y divide-slate-100'>
              {dashboard.projects.map((project) => (
                <tr key={project.id} className='hover:bg-slate-50/50'>
                  <td className='px-6 py-4 font-medium text-slate-900'>
                    {project.name}
                  </td>
                  <td className='px-6 py-4'>
                    <span className='px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium'>
                      {project.stage}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.health === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : project.health === 'At Risk'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {project.health}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-24 h-2 bg-slate-100 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-blue-600 rounded-full'
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className='text-xs text-slate-500'>
                        {Math.round(project.progress)}%
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>{project.activeRisks}</td>
                  <td className='px-6 py-4'>
                    {project.completedPoints} / {project.totalPoints}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      to={`/admin/projects/${project.id}`}
                      className='text-blue-600 hover:text-blue-800 font-medium text-xs'
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
