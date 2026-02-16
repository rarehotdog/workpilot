import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './utils';

type PopoverContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('Popover components must be used within <Popover>.');
  }
  return context;
}

export function Popover({
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
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  return <PopoverContext.Provider value={{ open: resolvedOpen, setOpen }}>{children}</PopoverContext.Provider>;
}

export function PopoverTrigger({ onClick, ...props }: React.ComponentProps<'button'>) {
  const { open, setOpen } = usePopoverContext();
  return (
    <button
      data-slot="popover-trigger"
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    />
  );
}

export function PopoverAnchor(props: React.ComponentProps<'div'>) {
  return <div data-slot="popover-anchor" {...props} />;
}

export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<'div'> & { align?: 'start' | 'center' | 'end'; sideOffset?: number }) {
  const { open, setOpen } = usePopoverContext();

  React.useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [open, setOpen]);

  if (!open || typeof document === 'undefined') return null;

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }[align];

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close popover"
        className="fixed inset-0 z-40 cursor-default bg-transparent"
        onClick={() => setOpen(false)}
      />
      <div
        data-slot="popover-content"
        style={{ marginTop: sideOffset }}
        className={cn(
          'fixed top-[calc(50%+0.5rem)] z-50 w-72 rounded-md border border-gray-200 bg-white p-4 shadow-md',
          alignClass,
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
