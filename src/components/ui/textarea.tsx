import * as React from 'react';
import { cn } from './utils';

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('input-surface body-14 w-full min-h-20 rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] disabled:opacity-50', className)}
      {...props}
    />
  );
}
