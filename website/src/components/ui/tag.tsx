import React from 'react';
import { cn } from '../../utils/cn';

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'soft'
    | 'muted'
    | 'outline'
    | 'neutral'
    | 'success'
    | 'warning'
    | 'error';
}

export function Tag({
  variant = 'soft',
  className,
  children,
  ...props
}: TagProps) {
  const variants = {
    soft: 'bg-brand-soft text-brand-strong',
    muted: 'bg-surface-muted text-text-muted',
    outline: 'border border-border-subtle text-text-muted bg-transparent',
    neutral: 'bg-stone-100 text-stone-700',
    success: 'bg-brand-soft text-brand-solid',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-brand-strong/10 text-brand-strong',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
