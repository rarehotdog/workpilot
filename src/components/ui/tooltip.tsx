import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from './utils';

type TooltipProviderProps = React.PropsWithChildren<{ delayDuration?: number }>;

type TooltipContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
  delayDuration: number;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ delayDuration = 0, children }: TooltipProviderProps) {
  return <div data-slot="tooltip-provider" data-delay={delayDuration}>{children}</div>;
}

export function Tooltip({
  open,
  defaultOpen = false,
  onOpenChange,
  delayDuration = 0,
  children,
}: React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; delayDuration?: number }>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return <TooltipContext.Provider value={{ open: resolvedOpen, setOpen, delayDuration }}>{children}</TooltipContext.Provider>;
}

function useTooltipContext() {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error('Tooltip components must be used within <Tooltip>.');
  return context;
}

export function TooltipTrigger({ onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }: React.ComponentProps<'button'>) {
  const { setOpen, delayDuration } = useTooltipContext();
  const timerRef = React.useRef<number | null>(null);

  const start = () => {
    timerRef.current = window.setTimeout(() => setOpen(true), delayDuration);
  };

  const stop = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  };

  return (
    <button
      data-slot="tooltip-trigger"
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        start();
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event);
        stop();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        start();
      }}
      onBlur={(event) => {
        onBlur?.(event);
        stop();
      }}
      {...props}
    />
  );
}

export function TooltipContent({ className, sideOffset = 0, children, ...props }: React.ComponentProps<'div'> & { sideOffset?: number }) {
  const { open } = useTooltipContext();

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-slot="tooltip-content"
      style={{ marginTop: sideOffset }}
      className={cn('fixed left-1/2 top-[calc(50%+0.5rem)] z-50 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-md', className)}
      {...props}
    >
      {children}
    </div>,
    document.body,
  );
}
