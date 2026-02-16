import * as React from 'react';
import { cn } from './utils';
import { Dialog, DialogClose, DialogDescription, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from './dialog';

export const Drawer = Dialog;
export const DrawerTrigger = DialogTrigger;
export const DrawerPortal = DialogPortal;
export const DrawerClose = DialogClose;

export function DrawerOverlay(props: React.ComponentProps<typeof DialogOverlay>) {
  return <DialogOverlay data-slot="drawer-overlay" {...props} />;
}

export function DrawerContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <div
        data-slot="drawer-content"
        className={cn('fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] rounded-t-lg border-t border-gray-200 bg-white p-4 shadow-lg', className)}
        {...props}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gray-300" />
        {children}
      </div>
    </DrawerPortal>
  );
}

export function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-header" className={cn('flex flex-col gap-1.5 p-1', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2 p-1', className)} {...props} />;
}

export function DrawerTitle(props: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="drawer-title" {...props} />;
}

export function DrawerDescription(props: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription data-slot="drawer-description" {...props} />;
}
