import { StatusNoteVersion } from '../../types/domain';

interface StatusNoteHistoryProps {
  versions: StatusNoteVersion[];
}

export function StatusNoteHistory({ versions }: StatusNoteHistoryProps) {
  if (versions.length === 0) {
    return <p className='text-sm text-slate-500'>No history available.</p>;
  }

  return (
    <div className='space-y-4'>
      {versions.map((version) => (
        <div key={version.id} className='border-l-2 border-slate-200 pl-4 py-1'>
          <p className='text-xs text-slate-500'>
            {new Date(version.createdAt).toLocaleString()}
          </p>
          <p className='text-sm text-slate-700 mt-1'>{version.noteText}</p>
        </div>
      ))}
    </div>
  );
}
