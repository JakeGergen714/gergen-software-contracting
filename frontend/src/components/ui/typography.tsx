import React from 'react';
import { cn } from '../../utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  variant?: 'display' | 'title' | 'subtitle';
}

export function Heading({
  level: Tag = 'h2',
  variant = 'title',
  className,
  children,
  ...props
}: HeadingProps) {
  const variants = {
    display:
      'font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary',
    title: 'font-display text-2xl sm:text-3xl font-semibold text-text-primary',
    subtitle: 'font-display text-xl font-medium text-text-primary',
  };

  return (
    <Tag className={cn(variants[variant], className)} {...props}>
      {children}
    </Tag>
  );
}

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?:
    | 'body'
    | 'muted'
    | 'small'
    | 'lead'
    | 'eyebrow'
    | 'label'
    | 'caption';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export function Text({
  variant = 'body',
  weight,
  className,
  children,
  ...props
}: TextProps) {
  const variants = {
    body: 'text-base text-text-primary',
    muted: 'text-base text-text-muted',
    small: 'text-sm text-text-muted',
    lead: 'text-lg sm:text-xl text-text-muted leading-relaxed',
    eyebrow: 'text-xs font-semibold uppercase tracking-wide text-text-muted',
    label: 'text-sm font-medium text-text-primary',
    caption: 'text-xs text-text-muted',
  };

  const weights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <p
      className={cn(variants[variant], weight && weights[weight], className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface KickerProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'soft';
}

export function Kicker({
  variant = 'default',
  className,
  children,
  ...props
}: KickerProps) {
  const variants = {
    default: 'text-text-muted',
    soft: 'text-brand-strong',
  };

  return (
    <p
      className={cn(
        'uppercase text-xs font-semibold tracking-[0.2em]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
