import * as React from 'react';
import { cn } from './utils';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';

export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
export const SheetPortal = DialogPortal;

export function SheetOverlay(props: React.ComponentProps<typeof DialogOverlay>) {
  return <DialogOverlay data-slot="sheet-overlay" {...props} />;
}

export function SheetContent({
  className,
  side = 'right',
  children,
  ...props
}: React.ComponentProps<'div'> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const sideClass = {
    top: 'inset-x-0 top-0 border-b rounded-b-xl',
    right: 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l',
    bottom: 'inset-x-0 bottom-0 border-t rounded-t-xl',
    left: 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r',
  }[side];

  return (
    <DialogPortal>
      <SheetOverlay />
      <div
        data-slot="sheet-content"
        role="dialog"
        aria-modal="true"
        className={cn('fixed z-50 bg-white p-4 shadow-xl', sideClass, className)}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  );
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 p-2', className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-footer" className={cn('mt-auto flex flex-col gap-2 p-2', className)} {...props} />;
}

export function SheetTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="sheet-title" {...props} />;
}

export function SheetDescription(props: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="sheet-description" {...props} />;
}
