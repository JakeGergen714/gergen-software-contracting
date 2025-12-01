import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useServices } from '../../../context/ServiceContext';
import {
  Dependency,
  CreateDependencyInput,
  DependencyType,
  ProjectDetail,
} from '../../../types/domain';
import { FaPlus, FaTrash, FaLink } from 'react-icons/fa';

export const AdminProjectDependencies: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useServices();
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateDependencyInput>({
    sourceId: '',
    targetId: '',
    type: 'BLOCKS',
  });

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;
    try {
      const [proj, deps] = await Promise.all([
        project.getProject(projectId),
        project.getDependencies(projectId),
      ]);
      setProjectDetail(proj);
      setDependencies(deps);
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await project.createDependency(projectId, formData);
      setIsCreating(false);
      setFormData({
        sourceId: '',
        targetId: '',
        type: 'BLOCKS',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create dependency', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!projectId) return;
    if (!window.confirm('Are you sure you want to delete this dependency?'))
      return;
    try {
      await project.deleteDependency(projectId, id);
      loadData();
    } catch (error) {
      console.error('Failed to delete dependency', error);
    }
  };

  const getItemName = (id: string) => {
    if (!projectDetail) return id;
    const epic = projectDetail.epics.find((e) => e.id === id);
    if (epic) return `Epic: ${epic.name}`;
    const story = projectDetail.stories.find((s) => s.id === id);
    if (story) return `Story: ${story.title}`;
    return id;
  };

  const allItems = projectDetail
    ? [
        ...projectDetail.epics.map((e) => ({
          id: e.id,
          name: `Epic: ${e.name}`,
        })),
        ...projectDetail.stories.map((s) => ({
          id: s.id,
          name: `Story: ${s.title}`,
        })),
      ]
    : [];

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Dependencies</h2>
          <p className='text-gray-500'>
            Manage dependencies between epics and stories
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className='flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
        >
          <FaPlus className='w-4 h-4 mr-2' />
          Add Dependency
        </button>
      </div>

      {isCreating && (
        <div className='bg-white p-6 rounded-lg shadow border border-gray-200'>
          <h3 className='text-lg font-medium mb-4'>Add Dependency</h3>
          <form onSubmit={handleCreate} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Source (Blocker)
                </label>
                <select
                  value={formData.sourceId}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceId: e.target.value })
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  required
                >
                  <option value=''>Select Item</option>
                  {allItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as DependencyType,
                    })
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                >
                  <option value='BLOCKS'>Blocks</option>
                  <option value='RELATES_TO'>Relates To</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Target (Blocked)
                </label>
                <select
                  value={formData.targetId}
                  onChange={(e) =>
                    setFormData({ ...formData, targetId: e.target.value })
                  }
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                  required
                >
                  <option value=''>Select Item</option>
                  {allItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
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
                Create Link
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='bg-white shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200'>
          {dependencies.map((dep) => (
            <li key={dep.id} className='p-6 hover:bg-gray-50'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='flex-shrink-0'>
                    <FaLink className='h-6 w-6 text-gray-400' />
                  </div>
                  <div>
                    <div className='flex items-center space-x-2'>
                      <span className='font-medium text-gray-900'>
                        {getItemName(dep.sourceId)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          dep.type === 'BLOCKS'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {dep.type}
                      </span>
                      <span className='font-medium text-gray-900'>
                        {getItemName(dep.targetId)}
                      </span>
                    </div>
                    <p className='text-sm text-gray-500'>
                      Created at {new Date(dep.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(dep.id)}
                  className='p-2 text-gray-400 hover:text-red-600'
                  title='Delete'
                >
                  <FaTrash className='w-5 h-5' />
                </button>
              </div>
            </li>
          ))}
          {dependencies.length === 0 && (
            <li className='p-6 text-center text-gray-500'>
              No dependencies found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
