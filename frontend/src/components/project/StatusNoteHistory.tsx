import { StatusNoteVersion } from '../../types/domain';
import { Stack } from '../ui/container';
import { Text } from '../ui/typography';

interface StatusNoteHistoryProps {
  versions: StatusNoteVersion[];
}

export function StatusNoteHistory({ versions }: StatusNoteHistoryProps) {
  if (versions.length === 0) {
    return (
      <Text variant='small' className='text-slate-500'>
        No history available.
      </Text>
    );
  }

  return (
    <Stack gap={4}>
      {versions.map((version) => (
        <div key={version.id} className='border-l-2 border-slate-200 pl-4 py-1'>
          <Text variant='caption' className='text-slate-500'>
            {new Date(version.createdAt).toLocaleString()}
          </Text>
          <Text variant='body' className='text-slate-700 mt-1'>
            {version.noteText}
          </Text>
        </div>
      ))}
    </Stack>
  );
}
