import React from 'react';
import { cn } from '../../utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'shell' | 'prose' | 'full';
}

export function Container({
  size = 'shell',
  className,
  children,
  ...props
}: ContainerProps) {
  const sizes = {
    shell: 'max-w-shell',
    prose: 'max-w-prose',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizes[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'none';
}

export function Section({
  spacing = 'lg',
  className,
  children,
  ...props
}: SectionProps) {
  const spacings = {
    none: '',
    sm: 'py-8 sm:py-10',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-24',
  };

  return (
    <section className={cn(spacings[spacing], className)} {...props}>
      {children}
    </section>
  );
}

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export function Stack({
  direction = 'col',
  gap = 4,
  align,
  justify,
  className,
  children,
  ...props
}: StackProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const gapClasses: Record<number, string> = {
    0: 'gap-0',
    0.5: 'gap-0.5',
    1: 'gap-1',
    1.5: 'gap-1.5',
    2: 'gap-2',
    2.5: 'gap-2.5',
    3: 'gap-3',
    3.5: 'gap-3.5',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    8: 'gap-8',
    10: 'gap-10',
    12: 'gap-12',
    16: 'gap-16',
    20: 'gap-20',
    24: 'gap-24',
    32: 'gap-32',
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        gapClasses[gap] ?? `gap-[${gap * 0.25}rem]`, // Fallback for arbitrary values if needed, though JIT might miss it
        align && alignClasses[align],
        justify && justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
