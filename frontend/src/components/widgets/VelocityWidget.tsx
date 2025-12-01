import React from 'react';

interface VelocityWidgetProps {
  velocity: number[];
  labels: string[];
}

export const VelocityWidget: React.FC<VelocityWidgetProps> = ({
  velocity,
  labels,
}) => {
  return (
    <div className='bg-white p-4 rounded shadow'>
      <h3 className='text-lg font-bold mb-2'>Project Velocity</h3>
      <div className='flex items-end space-x-2 h-32'>
        {velocity.map((v, i) => (
          <div key={i} className='flex flex-col items-center flex-1'>
            <div
              className='w-full bg-blue-500 rounded-t'
              style={{ height: `${Math.min(v * 2, 100)}%` }}
            />
            <span className='text-xs mt-1'>{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
