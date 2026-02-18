import * as React from 'react';
import { cn } from './utils';

const variantClass = {
  default: 'bg-[#7C3AED] text-white border-transparent',
  secondary: 'bg-gray-100 text-gray-900 border-transparent',
  destructive: 'bg-[#DC2626] text-white border-transparent',
  outline: 'bg-white text-gray-900 border-gray-200',
} as const;

type BadgeVariant = keyof typeof variantClass;

export function badgeVariants({ variant = 'default', className }: { variant?: BadgeVariant; className?: string } = {}) {
  return cn('inline-flex items-center rounded-full border px-2 py-0.5 caption-12 font-semibold', variantClass[variant], className);
}

export function Badge({ className, variant = 'default', ...props }: React.ComponentProps<'span'> & { variant?: BadgeVariant; asChild?: boolean }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
