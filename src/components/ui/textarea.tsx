import * as React from 'react';
import { cn } from './utils';

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn('w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50', className)}
      {...props}
    />
  );
}
