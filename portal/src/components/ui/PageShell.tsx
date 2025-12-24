import { ReactNode } from 'react';
import clsx from 'clsx';

interface PageShellProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function PageShell({
  children,
  as: Tag = 'div',
  className,
}: PageShellProps) {
  return (
    <Tag
      className={clsx('page-shell bg-surface-alt text-text-primary', className)}
    >
      <div className='grid-shell py-8 sm:py-10 lg:py-12'>{children}</div>
    </Tag>
  );
}
