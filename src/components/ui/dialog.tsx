import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './utils';

type DialogContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialogContext(): DialogContextValue {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within <Dialog>.');
  }
  return context;
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  React.useEffect(() => {
    if (!resolvedOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [resolvedOpen, setOpen]);

  return <DialogContext.Provider value={{ open: resolvedOpen, setOpen }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ onClick, ...props }: React.ComponentProps<'button'>) {
  const { setOpen } = useDialogContext();

  return (
    <button
      data-slot="dialog-trigger"
      onClick={(event) => {
        onClick?.(event);
        setOpen(true);
      }}
      {...props}
    />
  );
}

export function DialogPortal({ children }: React.PropsWithChildren) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

export function DialogOverlay({ className, onClick, ...props }: React.ComponentProps<'div'>) {
  const { setOpen } = useDialogContext();

  return (
    <div
      data-slot="dialog-overlay"
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export function DialogClose({ onClick, ...props }: React.ComponentProps<'button'>) {
  const { setOpen } = useDialogContext();

  return (
    <button
      data-slot="dialog-close"
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export function DialogContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { open } = useDialogContext();

  if (!open) return null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        data-slot="dialog-content"
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-lg',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return <h2 data-slot="dialog-title" className={cn('text-lg font-semibold leading-none', className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="dialog-description" className={cn('text-sm text-gray-500', className)} {...props} />;
}
