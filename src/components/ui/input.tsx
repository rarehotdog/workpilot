import * as React from 'react';
import { cn } from './utils';

export function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn('input-surface body-14 w-full h-11 rounded-2xl border border-gray-200 px-4 outline-none focus:ring-2 focus:ring-[#7C3AED]/25 focus:border-[#7C3AED] disabled:opacity-50', className)}
      {...props}
    />
  );
}
