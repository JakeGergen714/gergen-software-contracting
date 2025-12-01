import { ReactNode } from 'react';
import clsx from 'clsx';

interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
  variant?: 'default' | 'dark';
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  className,
  align = 'left',
  variant = 'default',
}: PageHeaderProps) {
  const isDark = variant === 'dark';

  return (
    <header
      className={clsx(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'text-center sm:text-left',
        className
      )}
    >
      <div>
        {kicker && (
          <p
            className={clsx(
              'uppercase text-xs font-semibold tracking-[0.2em]',
              isDark ? 'text-brand-soft' : 'text-text-muted'
            )}
          >
            {kicker}
          </p>
        )}
        <h1
          className={clsx(
            'font-display text-3xl sm:text-4xl',
            isDark ? 'text-white' : 'text-text-primary'
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={clsx(
              'mt-2 text-base max-w-prose',
              isDark ? 'text-text-faint' : 'text-text-muted'
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className='flex flex-shrink-0 items-center gap-3'>{actions}</div>
      )}
    </header>
  );
}
