import { ProjectStage } from '../../types/domain';
import { stageCopy, stageOrder } from './stageMeta';

interface StageControlsProps {
  currentStage: ProjectStage;
  onSelect: (stage: ProjectStage) => void;
  disabled?: boolean;
}

export function StageControls({
  currentStage,
  onSelect,
  disabled,
}: StageControlsProps) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4'>
      <div className='text-xs uppercase text-slate-500'>Admin controls</div>
      <div className='flex flex-wrap gap-2 mt-3'>
        {stageOrder.map((stage) => (
          <button
            key={stage}
            type='button'
            onClick={() => onSelect(stage)}
            disabled={disabled || stage === currentStage}
            className={`rounded-full px-3 py-1 text-sm border transition ${
              stage === currentStage
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-300 text-slate-600 hover:border-slate-400'
            } disabled:opacity-50`}
          >
            {stageCopy[stage].title}
          </button>
        ))}
      </div>
    </div>
  );
}
