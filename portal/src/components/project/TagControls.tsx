import React, { useEffect, useState } from 'react';
import { Tag, TagType } from '../../types/domain';
import { useServices } from '../../context/ServiceContext';

interface Props {
  projectId: string;
  epicId: string;
}

export const TagControls: React.FC<Props> = ({ projectId, epicId }) => {
  const { tags } = useServices();
  const [available, setAvailable] = useState<Tag[]>([]);
  const [attached, setAttached] = useState<Tag[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TagType>('OTHER');
  const refresh = () => {
    tags.listTags().then(setAvailable);
    tags.listEpicTags(projectId, epicId).then(setAttached);
  };
  useEffect(refresh, [projectId, epicId]);

  const handleAttach = async (tag: Tag) => {
    await tags.attachEpicTag(projectId, epicId, { tagId: tag.id });
    refresh();
  };
  const handleCreateAttach = async () => {
    if (!newName.trim()) return;
    await tags.attachEpicTag(projectId, epicId, {
      name: newName.trim(),
      type: newType,
    });
    setCreating(false);
    setNewName('');
    setNewType('OTHER');
    refresh();
  };
  const handleDetach = async (tag: Tag) => {
    await tags.detachEpicTag(projectId, epicId, tag.id);
    refresh();
  };

  const unattached = available.filter(
    (a) => !attached.some((t) => t.id === a.id)
  );

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-2'>
        {attached.map((tag) => (
          <span
            key={tag.id}
            className='inline-flex items-center gap-1 rounded-full bg-slate-800 text-white px-3 py-1 text-xs'
          >
            {tag.name}
            <button
              onClick={() => handleDetach(tag)}
              aria-label='Remove'
              className='text-white/70 hover:text-white'
            >
              ×
            </button>
          </span>
        ))}
        {attached.length === 0 && (
          <span className='text-xs text-gray-500'>No tags</span>
        )}
      </div>
      <details className='rounded border border-slate-200 bg-white p-2'>
        <summary className='cursor-pointer text-xs font-semibold'>
          Add tag
        </summary>
        <div className='mt-2 space-y-2'>
          <div className='flex flex-wrap gap-2'>
            {unattached.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAttach(tag)}
                className='rounded-full border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50'
              >
                {tag.name}
              </button>
            ))}
            {unattached.length === 0 && (
              <span className='text-xs text-gray-400'>No unused tags</span>
            )}
          </div>
          {creating ? (
            <div className='flex flex-wrap items-center gap-2'>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder='New tag'
                className='rounded border border-slate-300 px-2 py-1 text-xs'
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as TagType)}
                className='rounded border border-slate-300 px-2 py-1 text-xs'
              >
                <option value='REGULATORY'>Regulatory</option>
                <option value='PERFORMANCE'>Performance</option>
                <option value='MAINTENANCE'>Maintenance</option>
                <option value='SECURITY'>Security</option>
                <option value='OTHER'>Other</option>
              </select>
              <button
                onClick={handleCreateAttach}
                className='rounded bg-slate-800 px-3 py-1 text-xs text-white'
              >
                Add
              </button>
              <button
                onClick={() => setCreating(false)}
                className='rounded px-2 py-1 text-xs text-slate-600'
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className='text-xs text-blue-600 underline'
            >
              Create new tag
            </button>
          )}
        </div>
      </details>
    </div>
  );
};
