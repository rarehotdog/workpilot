import * as React from 'react';
import { cn } from './utils';

export function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn('w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50', className)}
      {...props}
    />
  );
}
