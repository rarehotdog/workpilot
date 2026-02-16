import * as React from 'react';
import { cn } from './utils';

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />;
}
