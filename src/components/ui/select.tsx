import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from './utils';

type SelectContextValue = {
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('Select components must be used within <Select>.');
  return context;
}

export function Select({
  value,
  defaultValue = '',
  onValueChange,
  open,
  onOpenChange,
  children,
}: React.PropsWithChildren<{
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isValueControlled = value !== undefined;
  const resolvedValue = isValueControlled ? value : internalValue;

  const isOpenControlled = open !== undefined;
  const resolvedOpen = isOpenControlled ? open : internalOpen;

  const setValue = (nextValue: string) => {
    if (!isValueControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const setOpen = (nextOpen: boolean) => {
    if (!isOpenControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return <SelectContext.Provider value={{ value: resolvedValue, setValue, open: resolvedOpen, setOpen }}>{children}</SelectContext.Provider>;
}

export function SelectGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="select-group" {...props} />;
}

export function SelectValue({ placeholder, ...props }: React.ComponentProps<'span'> & { placeholder?: React.ReactNode }) {
  const { value } = useSelectContext();
  return <span data-slot="select-value" {...props}>{value || placeholder}</span>;
}

export function SelectTrigger({
  className,
  size = 'default',
  children,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { size?: 'sm' | 'default' }) {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      type="button"
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-purple-300',
        size === 'default' ? 'h-9' : 'h-8',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: React.ComponentProps<'div'> & { position?: 'item-aligned' | 'popper' }) {
  const { open, setOpen } = useSelectContext();

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <button type="button" className="fixed inset-0 z-40 bg-transparent" aria-label="Close select" onClick={() => setOpen(false)} />
      <div
        data-slot="select-content"
        data-position={position}
        className={cn('fixed left-1/2 top-[calc(50%+0.5rem)] z-50 max-h-72 min-w-[8rem] -translate-x-1/2 overflow-auto rounded-md border border-gray-200 bg-white shadow-md', className)}
        {...props}
      >
        <SelectScrollUpButton />
        <div className="p-1">{children}</div>
        <SelectScrollDownButton />
      </div>
    </>,
    document.body,
  );
}

export function SelectLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="select-label" className={cn('px-2 py-1.5 text-xs text-gray-500', className)} {...props} />;
}

export function SelectItem({
  className,
  children,
  value,
  onClick,
  ...props
}: React.ComponentProps<'button'> & { value: string }) {
  const { value: selectedValue, setValue, setOpen } = useSelectContext();
  const selected = selectedValue === value;

  return (
    <button
      type="button"
      data-slot="select-item"
      className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-left text-sm hover:bg-gray-100', className)}
      onClick={(event) => {
        onClick?.(event);
        setValue(value);
        setOpen(false);
      }}
      {...props}
    >
      <span className="absolute right-2 inline-flex h-4 w-4 items-center justify-center">
        {selected ? <Check className="h-4 w-4" /> : null}
      </span>
      <span>{children}</span>
    </button>
  );
}

export function SelectSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="select-separator" className={cn('-mx-1 my-1 h-px bg-gray-200', className)} {...props} />;
}

export function SelectScrollUpButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button type="button" data-slot="select-scroll-up-button" className={cn('flex w-full items-center justify-center py-1 text-gray-500', className)} {...props}>
      <ChevronUp className="h-4 w-4" />
    </button>
  );
}

export function SelectScrollDownButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button type="button" data-slot="select-scroll-down-button" className={cn('flex w-full items-center justify-center py-1 text-gray-500', className)} {...props}>
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}
