import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from './utils';

type ContextMenuContextValue = {
  open: boolean;
  x: number;
  y: number;
  setState: (state: { open: boolean; x?: number; y?: number }) => void;
};

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext() {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error('ContextMenu components must be used within <ContextMenu>.');
  }
  return context;
}

export function ContextMenu({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  const setState = ({ open: nextOpen, x, y }: { open: boolean; x?: number; y?: number }) => {
    setOpen(nextOpen);
    if (x !== undefined && y !== undefined) setCoords({ x, y });
  };

  return (
    <ContextMenuContext.Provider value={{ open, x: coords.x, y: coords.y, setState }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export function ContextMenuTrigger({ onContextMenu, ...props }: React.ComponentProps<'div'>) {
  const { setState } = useContextMenuContext();

  return (
    <div
      data-slot="context-menu-trigger"
      onContextMenu={(event) => {
        onContextMenu?.(event);
        event.preventDefault();
        setState({ open: true, x: event.clientX, y: event.clientY });
      }}
      {...props}
    />
  );
}

export function ContextMenuGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="context-menu-group" {...props} />;
}

export function ContextMenuPortal({ children }: React.PropsWithChildren) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

export function ContextMenuSub(props: React.ComponentProps<'div'>) {
  return <div data-slot="context-menu-sub" {...props} />;
}

export function ContextMenuRadioGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="context-menu-radio-group" role="radiogroup" {...props} />;
}

export function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<'button'> & { inset?: boolean }) {
  return (
    <button
      type="button"
      data-slot="context-menu-sub-trigger"
      className={cn('flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100', inset && 'pl-8', className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  );
}

export function ContextMenuSubContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="context-menu-sub-content" className={cn('min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-md', className)} {...props} />;
}

export function ContextMenuContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { open, x, y, setState } = useContextMenuContext();
  if (!open) return null;

  return (
    <ContextMenuPortal>
      <button type="button" className="fixed inset-0 z-40 bg-transparent" aria-label="Close context menu" onClick={() => setState({ open: false })} />
      <div
        data-slot="context-menu-content"
        style={{ left: x, top: y }}
        className={cn('fixed z-50 min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 shadow-md', className)}
        {...props}
      />
    </ContextMenuPortal>
  );
}

export function ContextMenuItem({ className, inset, variant = 'default', ...props }: React.ComponentProps<'button'> & { inset?: boolean; variant?: 'default' | 'destructive' }) {
  return (
    <button
      type="button"
      data-slot="context-menu-item"
      className={cn('flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100', inset && 'pl-8', variant === 'destructive' && 'text-red-600 hover:bg-red-50', className)}
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<'button'> & { checked?: boolean }) {
  return (
    <button type="button" data-slot="context-menu-checkbox-item" className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-gray-100', className)} {...props}>
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center">{checked ? <Check className="h-4 w-4" /> : null}</span>
      {children}
    </button>
  );
}

export function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button type="button" data-slot="context-menu-radio-item" className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-gray-100', className)} {...props}>
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center"><Circle className="h-2 w-2 fill-current" /></span>
      {children}
    </button>
  );
}

export function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<'div'> & { inset?: boolean }) {
  return <div data-slot="context-menu-label" className={cn('px-2 py-1.5 text-sm font-medium', inset && 'pl-8', className)} {...props} />;
}

export function ContextMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="context-menu-separator" className={cn('-mx-1 my-1 h-px bg-gray-200', className)} {...props} />;
}

export function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="context-menu-shortcut" className={cn('ml-auto text-xs tracking-widest text-gray-500', className)} {...props} />;
}
