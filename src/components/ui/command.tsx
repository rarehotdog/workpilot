import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from './utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

export function Command({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="command" className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-900', className)} {...props} />;
}

export function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & { title?: string; description?: string }) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <div data-slot="command-input-wrapper" className="flex h-10 items-center gap-2 border-b border-gray-200 px-3">
      <Search className="h-4 w-4 shrink-0 opacity-50" />
      <input data-slot="command-input" className={cn('h-9 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:opacity-50', className)} {...props} />
    </div>
  );
}

export function CommandList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="command-list" className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)} {...props} />;
}

export function CommandEmpty(props: React.ComponentProps<'div'>) {
  return <div data-slot="command-empty" className="py-6 text-center text-sm" {...props} />;
}

export function CommandGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="command-group" className={cn('overflow-hidden p-1 text-gray-900', className)} {...props} />;
}

export function CommandSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="command-separator" className={cn('-mx-1 h-px bg-gray-200', className)} {...props} />;
}

export function CommandItem({ className, ...props }: React.ComponentProps<'button'>) {
  return <button type="button" data-slot="command-item" className={cn('flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-gray-100 disabled:opacity-50', className)} {...props} />;
}

export function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="command-shortcut" className={cn('ml-auto text-xs tracking-widest text-gray-500', className)} {...props} />;
}
