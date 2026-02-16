import * as React from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, Check, Circle } from 'lucide-react';
import { cn } from './utils';

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within <DropdownMenu>.');
  }
  return context;
}

export function DropdownMenu({
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

  return <DropdownMenuContext.Provider value={{ open: resolvedOpen, setOpen }}>{children}</DropdownMenuContext.Provider>;
}

export function DropdownMenuPortal({ children }: React.PropsWithChildren) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

export function DropdownMenuTrigger({ onClick, ...props }: React.ComponentProps<'button'>) {
  const { open, setOpen } = useDropdownMenuContext();
  return (
    <button
      data-slot="dropdown-menu-trigger"
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    />
  );
}

export function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<'div'> & { sideOffset?: number }) {
  const { open, setOpen } = useDropdownMenuContext();
  if (!open) return null;

  return (
    <DropdownMenuPortal>
      <button type="button" aria-label="Close menu" className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpen(false)} />
      <div
        data-slot="dropdown-menu-content"
        style={{ marginTop: sideOffset }}
        className={cn('fixed left-1/2 top-[calc(50%+0.5rem)] z-50 min-w-[12rem] -translate-x-1/2 rounded-md border border-gray-200 bg-white p-1 shadow-md', className)}
        {...props}
      />
    </DropdownMenuPortal>
  );
}

export function DropdownMenuGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="dropdown-menu-group" {...props} />;
}

export function DropdownMenuItem({ className, inset, variant = 'default', ...props }: React.ComponentProps<'button'> & { inset?: boolean; variant?: 'default' | 'destructive' }) {
  return (
    <button
      type="button"
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-gray-100',
        inset && 'pl-8',
        variant === 'destructive' && 'text-red-600 hover:bg-red-50',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<'button'> & { checked?: boolean }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      data-slot="dropdown-menu-checkbox-item"
      className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-gray-100', className)}
      {...props}
    >
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center">{checked ? <Check className="h-4 w-4" /> : null}</span>
      {children}
    </button>
  );
}

export function DropdownMenuRadioGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="dropdown-menu-radio-group" role="radiogroup" {...props} />;
}

export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      type="button"
      role="menuitemradio"
      data-slot="dropdown-menu-radio-item"
      className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-gray-100', className)}
      {...props}
    >
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center"><Circle className="h-2 w-2 fill-current" /></span>
      {children}
    </button>
  );
}

export function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<'div'> & { inset?: boolean }) {
  return <div data-slot="dropdown-menu-label" className={cn('px-2 py-1.5 text-sm font-medium', inset && 'pl-8', className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dropdown-menu-separator" className={cn('-mx-1 my-1 h-px bg-gray-200', className)} {...props} />;
}

export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="dropdown-menu-shortcut" className={cn('ml-auto text-xs tracking-widest text-gray-500', className)} {...props} />;
}

export function DropdownMenuSub(props: React.ComponentProps<'div'>) {
  return <div data-slot="dropdown-menu-sub" {...props} />;
}

export function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<'button'> & { inset?: boolean }) {
  return (
    <button
      type="button"
      data-slot="dropdown-menu-sub-trigger"
      className={cn('flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100', inset && 'pl-8', className)}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  );
}

export function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dropdown-menu-sub-content" className={cn('min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg', className)} {...props} />;
}
