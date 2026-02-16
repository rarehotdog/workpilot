import * as React from 'react';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { cn } from './utils';

export function Menubar({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="menubar" className={cn('flex h-9 items-center gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-sm', className)} {...props} />;
}

export function MenubarMenu(props: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-menu" {...props} />;
}

export function MenubarGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-group" {...props} />;
}

export function MenubarPortal({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function MenubarRadioGroup(props: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-radio-group" role="radiogroup" {...props} />;
}

export function MenubarTrigger({ className, ...props }: React.ComponentProps<'button'>) {
  return <button type="button" data-slot="menubar-trigger" className={cn('rounded-sm px-2 py-1 text-sm font-medium hover:bg-gray-100', className)} {...props} />;
}

export function MenubarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-content" className={cn('min-w-[12rem] rounded-md border border-gray-200 bg-white p-1 shadow-md', className)} {...props} />;
}

export function MenubarItem({ className, inset, variant = 'default', ...props }: React.ComponentProps<'button'> & { inset?: boolean; variant?: 'default' | 'destructive' }) {
  return <button type="button" data-slot="menubar-item" className={cn('flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100', inset && 'pl-8', variant === 'destructive' && 'text-red-600 hover:bg-red-50', className)} {...props} />;
}

export function MenubarCheckboxItem({ className, children, checked, ...props }: React.ComponentProps<'button'> & { checked?: boolean }) {
  return (
    <button type="button" data-slot="menubar-checkbox-item" className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-gray-100', className)} {...props}>
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center">{checked ? <Check className="h-4 w-4" /> : null}</span>
      {children}
    </button>
  );
}

export function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<'button'>) {
  return (
    <button type="button" data-slot="menubar-radio-item" className={cn('relative flex w-full items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 text-left text-sm hover:bg-gray-100', className)} {...props}>
      <span className="absolute left-2 inline-flex h-4 w-4 items-center justify-center"><Circle className="h-2 w-2 fill-current" /></span>
      {children}
    </button>
  );
}

export function MenubarLabel({ className, inset, ...props }: React.ComponentProps<'div'> & { inset?: boolean }) {
  return <div data-slot="menubar-label" className={cn('px-2 py-1.5 text-sm font-medium', inset && 'pl-8', className)} {...props} />;
}

export function MenubarSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-separator" className={cn('-mx-1 my-1 h-px bg-gray-200', className)} {...props} />;
}

export function MenubarShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="menubar-shortcut" className={cn('ml-auto text-xs tracking-widest text-gray-500', className)} {...props} />;
}

export function MenubarSub(props: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-sub" {...props} />;
}

export function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<'button'> & { inset?: boolean }) {
  return (
    <button type="button" data-slot="menubar-sub-trigger" className={cn('flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100', inset && 'pl-8', className)} {...props}>
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </button>
  );
}

export function MenubarSubContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="menubar-sub-content" className={cn('min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg', className)} {...props} />;
}
