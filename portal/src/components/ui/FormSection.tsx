import { ReactNode } from 'react';
import clsx from 'clsx';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  aside,
  className,
}: FormSectionProps) {
  return (
    <section
      className={clsx(
        'rounded-lg border border-border-subtle bg-surface p-6 shadow-card',
        className
      )}
    >
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        <div className='lg:w-1/3 space-y-2'>
          <h3 className='text-lg font-semibold text-text-primary'>{title}</h3>
          {description && (
            <p className='text-sm text-text-muted'>{description}</p>
          )}
          {aside && <div className='mt-4 text-sm text-text-muted'>{aside}</div>}
        </div>
        <div className='flex-1 space-y-4'>{children}</div>
      </div>
    </section>
  );
}
