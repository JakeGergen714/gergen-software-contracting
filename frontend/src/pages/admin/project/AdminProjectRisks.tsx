import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import {
  Risk,
  CreateRiskInput,
  RiskStatus,
  RiskProbability,
  RiskImpact,
} from '../../../types/domain';
import {
  FaPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
} from 'react-icons/fa';

export const AdminProjectRisks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useServices();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [formData, setFormData] = useState<CreateRiskInput>({
    title: '',
    description: '',
    probability: 'LOW',
    impact: 'NEGLIGIBLE',
    mitigationPlan: '',
  });

  useEffect(() => {
    if (projectId) {
      loadRisks();
    }
  }, [projectId]);

  const loadRisks = async () => {
    if (!projectId) return;
    try {
      const data = await project.getRisks(projectId);
      setRisks(data);
    } catch (error) {
      console.error('Failed to load risks', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await project.createRisk(projectId, formData);
      setIsCreating(false);
      setFormData({
        title: '',
        description: '',
        probability: 'LOW',
        impact: 'NEGLIGIBLE',
        mitigationPlan: '',
      });
      loadRisks();
    } catch (error) {
      console.error('Failed to create risk', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !editingRisk) return;
    try {
      await project.updateRisk(projectId, editingRisk.id, formData);
      setEditingRisk(null);
      setFormData({
        title: '',
        description: '',
        probability: 'LOW',
        impact: 'NEGLIGIBLE',
        mitigationPlan: '',
      });
      loadRisks();
    } catch (error) {
      console.error('Failed to update risk', error);
    }
  };

  const handleStatusChange = async (riskId: string, status: RiskStatus) => {
    if (!projectId) return;
    try {
      await project.updateRiskStatus(projectId, riskId, status);
      loadRisks();
    } catch (error) {
      console.error('Failed to update risk status', error);
    }
  };

  const startEdit = (risk: Risk) => {
    setEditingRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description,
      probability: risk.probability,
      impact: risk.impact,
      mitigationPlan: risk.mitigationPlan,
      linkedEpicId: risk.linkedEpicId,
      linkedStoryId: risk.linkedStoryId,
    });
    setIsCreating(true);
  };

  const getProbabilityColor = (prob: RiskProbability) => {
    switch (prob) {
      case 'LOW':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'CERTAIN':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: RiskImpact) => {
    switch (impact) {
      case 'NEGLIGIBLE':
        return 'bg-green-100 text-green-800';
      case 'MARGINAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'CRITICAL':
        return 'bg-orange-100 text-orange-800';
      case 'CATASTROPHIC':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800';
      case 'MITIGATED':
        return 'bg-green-100 text-green-800';
      case 'REALIZED':
        return 'bg-red-100 text-red-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Risk Management</h2>
          <p className='text-gray-500'>Identify and track project risks</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingRisk(null);
            setFormData({
              title: '',
              description: '',
              probability: 'LOW',
              impact: 'NEGLIGIBLE',
              mitigationPlan: '',
            });
          }}
          className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
        >
          <FaPlus className='w-4 h-4 mr-2' />
          Log Risk
        </button>
      </div>

      {isCreating && (
        <div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
          <h3 className='text-lg font-medium mb-4'>
            {editingRisk ? 'Edit Risk' : 'Log New Risk'}
          </h3>
          <form
            onSubmit={editingRisk ? handleUpdate : handleCreate}
            className='space-y-4'
          >
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Title
              </label>
              <input
                type='text'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                required
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Probability
                </label>
                <select
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      probability: e.target.value as RiskProbability,
                    })
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                >
                  <option value='LOW'>Low</option>
                  <option value='MEDIUM'>Medium</option>
                  <option value='HIGH'>High</option>
                  <option value='CERTAIN'>Certain</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Impact
                </label>
                <select
                  value={formData.impact}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      impact: e.target.value as RiskImpact,
                    })
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                >
                  <option value='NEGLIGIBLE'>Negligible</option>
                  <option value='MARGINAL'>Marginal</option>
                  <option value='CRITICAL'>Critical</option>
                  <option value='CATASTROPHIC'>Catastrophic</option>
                </select>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Mitigation Plan
              </label>
              <textarea
                value={formData.mitigationPlan}
                onChange={(e) =>
                  setFormData({ ...formData, mitigationPlan: e.target.value })
                }
                rows={3}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                required
              />
            </div>
            <div className='flex justify-end space-x-3'>
              <button
                type='button'
                onClick={() => setIsCreating(false)}
                className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700'
              >
                {editingRisk ? 'Update Risk' : 'Log Risk'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='bg-white shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200'>
          {risks.map((risk) => (
            <li key={risk.id} className='p-6 hover:bg-gray-50'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      {risk.title}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        risk.status
                      )}`}
                    >
                      {risk.status}
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-gray-500'>
                    {risk.description}
                  </p>
                  <div className='mt-2 flex items-center space-x-4 text-sm'>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getProbabilityColor(
                        risk.probability
                      )}`}
                    >
                      Prob: {risk.probability}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getImpactColor(
                        risk.impact
                      )}`}
                    >
                      Impact: {risk.impact}
                    </span>
                  </div>
                  <div className='mt-2 text-sm text-gray-600'>
                    <strong>Mitigation:</strong> {risk.mitigationPlan}
                  </div>
                </div>
                <div className='flex items-center space-x-2 ml-4'>
                  <button
                    onClick={() => startEdit(risk)}
                    className='p-2 text-gray-400 hover:text-gray-600'
                    title='Edit'
                  >
                    <FaEdit className='w-5 h-5' />
                  </button>
                  {risk.status === 'OPEN' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(risk.id, 'MITIGATED')}
                        className='p-2 text-green-600 hover:text-green-800'
                        title='Mark Mitigated'
                      >
                        <FaCheckCircle className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleStatusChange(risk.id, 'REALIZED')}
                        className='p-2 text-red-600 hover:text-red-800'
                        title='Mark Realized'
                      >
                        <FaExclamationTriangle className='w-5 h-5' />
                      </button>
                    </>
                  )}
                  {risk.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleStatusChange(risk.id, 'CLOSED')}
                      className='p-2 text-gray-400 hover:text-gray-600'
                      title='Close Risk'
                    >
                      <FaTimesCircle className='w-5 h-5' />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
          {risks.length === 0 && (
            <li className='p-6 text-center text-gray-500'>
              No risks logged yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
