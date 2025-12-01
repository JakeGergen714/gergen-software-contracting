import React from 'react';

interface BudgetBurndownWidgetProps {
  totalBudget: number;
  spent: number;
  remaining: number;
}

export const BudgetBurndownWidget: React.FC<BudgetBurndownWidgetProps> = ({
  totalBudget,
  spent,
  remaining,
}) => {
  const spentPercentage = (spent / totalBudget) * 100;

  return (
    <div className='bg-white p-4 rounded shadow'>
      <h3 className='text-lg font-bold mb-2'>Budget Burn-down</h3>
      <div className='mb-2'>
        <span className='text-sm text-gray-600'>
          Total Budget: ${totalBudget.toLocaleString()}
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-4 mb-2'>
        <div
          className='bg-green-500 h-4 rounded-full'
          style={{ width: `${spentPercentage}%` }}
        ></div>
      </div>
      <div className='flex justify-between text-sm'>
        <span>Spent: ${spent.toLocaleString()}</span>
        <span>Remaining: ${remaining.toLocaleString()}</span>
      </div>
    </div>
  );
};
