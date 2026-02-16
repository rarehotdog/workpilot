import * as React from 'react';
import { cn } from './utils';

export function Progress({ className, value = 0, ...props }: React.ComponentProps<'div'> & { value?: number }) {
  const normalized = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div data-slot="progress" className={cn('relative h-2 w-full overflow-hidden rounded-full bg-gray-200', className)} {...props}>
      <div data-slot="progress-indicator" className="h-full bg-blue-600 transition-all" style={{ width: `${normalized}%` }} />
    </div>
  );
}
