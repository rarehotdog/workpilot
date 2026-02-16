import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './utils';

type HoverCardContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function useHoverCardContext() {
  const context = React.useContext(HoverCardContext);
  if (!context) {
    throw new Error('HoverCard components must be used within <HoverCard>.');
  }
  return context;
}

export function HoverCard({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return <HoverCardContext.Provider value={{ open: resolvedOpen, setOpen }}>{children}</HoverCardContext.Provider>;
}

export function HoverCardTrigger({ onMouseEnter, onMouseLeave, ...props }: React.ComponentProps<'div'>) {
  const { setOpen } = useHoverCardContext();

  return (
    <div
      data-slot="hover-card-trigger"
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        setOpen(true);
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<'div'> & { align?: 'start' | 'center' | 'end'; sideOffset?: number }) {
  const { open } = useHoverCardContext();

  if (!open || typeof document === 'undefined') return null;

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  }[align];

  return createPortal(
    <div
      data-slot="hover-card-content"
      style={{ marginTop: sideOffset }}
      className={cn('fixed top-[calc(50%+0.5rem)] z-50 w-64 rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-md', alignClass, className)}
      {...props}
    />,
    document.body,
  );
}
