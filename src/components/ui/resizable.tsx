import * as React from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from './utils';

export function ResizablePanelGroup({ className, ...props }: React.ComponentProps<'div'> & { direction?: 'horizontal' | 'vertical' }) {
  return <div data-slot="resizable-panel-group" className={cn('flex h-full w-full', className)} {...props} />;
}

export function ResizablePanel(props: React.ComponentProps<'div'>) {
  return <div data-slot="resizable-panel" {...props} />;
}

export function ResizableHandle({ withHandle, className, ...props }: React.ComponentProps<'div'> & { withHandle?: boolean }) {
  return (
    <div data-slot="resizable-handle" className={cn('relative flex w-px items-center justify-center bg-gray-200', className)} {...props}>
      {withHandle ? (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border border-gray-300 bg-white">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      ) : null}
    </div>
  );
}
