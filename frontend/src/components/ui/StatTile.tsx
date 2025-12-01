import { ReactNode } from 'react';
import clsx from 'clsx';

interface StatTileProps {
  label: string;
  value: string | number;
  helper?: string;
  trend?: ReactNode;
  icon?: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'neutral';
  className?: string;
}

const accentMap: Record<NonNullable<StatTileProps['accent']>, string> = {
  brand: 'border-brand/20',
  emerald: 'border-emerald-200',
  amber: 'border-amber-200',
  neutral: 'border-border-subtle',
};

export function StatTile({
  label,
  value,
  helper,
  trend,
  icon,
  accent = 'brand',
  className,
}: StatTileProps) {
  return (
    <div
      className={clsx(
        'stat-tile relative rounded-lg border bg-surface p-5 shadow-card',
        accentMap[accent],
        className
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='text-xs tracking-wide uppercase text-text-muted'>
            {label}
          </p>
          <p className='mt-2 text-3xl font-semibold text-text-primary'>
            {value}
          </p>
          {helper && <p className='mt-1 text-sm text-text-muted'>{helper}</p>}
        </div>
        {icon && (
          <div className='h-10 w-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center'>
            {icon}
          </div>
        )}
      </div>
      {trend && <div className='mt-4 text-sm text-text-muted'>{trend}</div>}
    </div>
  );
}
