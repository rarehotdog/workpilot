import * as React from 'react';
import { cn } from './utils';

export function ScrollArea({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="scroll-area" className={cn('relative overflow-hidden', className)} {...props}>
      <div data-slot="scroll-area-viewport" className="h-full w-full overflow-auto rounded-[inherit]">{children}</div>
      <ScrollBar />
    </div>
  );
}

export function ScrollBar({ className, orientation = 'vertical', ...props }: React.ComponentProps<'div'> & { orientation?: 'vertical' | 'horizontal' }) {
  return (
    <div
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      className={cn(
        'pointer-events-none absolute opacity-0',
        orientation === 'vertical' ? 'right-0 top-0 h-full w-2.5' : 'bottom-0 left-0 h-2.5 w-full',
        className,
      )}
      {...props}
    >
      <div data-slot="scroll-area-thumb" className="relative flex-1 rounded-full bg-gray-300" />
    </div>
  );
}
