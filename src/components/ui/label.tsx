import * as React from 'react';
import { cn } from './utils';

export function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('inline-flex items-center gap-2 body-14 font-medium text-gray-900', className)}
      {...props}
    />
  );
}
