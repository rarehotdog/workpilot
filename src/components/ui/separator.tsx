import * as React from 'react';
import { cn } from './utils';

export function Separator({ className, orientation = 'horizontal', ...props }: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical'; decorative?: boolean }) {
  return (
    <div
      data-slot="separator-root"
      role="separator"
      aria-orientation={orientation}
      className={cn(orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px', 'bg-gray-200 shrink-0', className)}
      {...props}
    />
  );
}
