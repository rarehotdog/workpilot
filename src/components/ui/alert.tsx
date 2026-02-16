import * as React from 'react';
import { cn } from './utils';

const variantClass = {
  default: 'bg-white text-gray-900 border-gray-200',
  destructive: 'bg-red-50 text-red-700 border-red-200',
} as const;

type AlertVariant = keyof typeof variantClass;

export function Alert({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & { variant?: AlertVariant }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        'relative grid w-full items-start gap-1 rounded-lg border px-4 py-3 text-sm [&>svg~*]:pl-7',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.ComponentProps<'h5'>) {
  return <h5 data-slot="alert-title" className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('text-sm opacity-90 [&_p]:leading-relaxed', className)} {...props} />;
}
