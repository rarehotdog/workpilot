import * as React from 'react';
import { cn } from './utils';

export function Avatar({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar"
      className={cn('relative inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100', className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: React.ComponentProps<'img'>) {
  return <img data-slot="avatar-image" className={cn('h-full w-full object-cover', className)} {...props} />;
}

export function AvatarFallback({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="avatar-fallback"
      className={cn('flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700', className)}
      {...props}
    />
  );
}
