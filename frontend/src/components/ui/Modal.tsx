import { ReactNode } from 'react';
import clsx from 'clsx';

interface ModalProps {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

export function Modal({
  title,
  description,
  open,
  onClose,
  children,
  actions,
  width = 'md',
}: ModalProps) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
      <div
        className={clsx(
          'rounded-2xl bg-white shadow-[0_25px_70px_rgba(15,23,42,0.25)] border border-slate-200 w-full max-h-[90vh] overflow-y-auto',
          {
            'max-w-lg': width === 'sm',
            'max-w-2xl': width === 'md',
            'max-w-4xl': width === 'lg',
          }
        )}
      >
        <div className='border-b border-slate-100 px-5 py-4'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-xl font-semibold text-slate-900'>{title}</h3>
              {description && (
                <p className='text-sm text-slate-500'>{description}</p>
              )}
            </div>
            <button
              type='button'
              onClick={onClose}
              className='rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50'
            >
              Close
            </button>
          </div>
        </div>
        <div className='px-5 py-4'>{children}</div>
        {actions && (
          <div className='border-t border-slate-100 px-5 py-4 flex justify-end gap-3'>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
