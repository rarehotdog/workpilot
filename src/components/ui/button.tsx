import * as React from 'react';
import { cn } from './utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClass: Record<ButtonVariant, string> = {
  default: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]',
  destructive: 'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
  outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  link: 'text-[#6366F1] underline-offset-4 hover:underline',
};

const sizeClass: Record<ButtonSize, string> = {
  default: 'h-11 px-4',
  sm: 'h-9 px-3 text-xs',
  lg: 'h-12 px-6',
  icon: 'h-10 w-10',
};

export function buttonVariants({
  variant = 'default',
  size = 'default',
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-2xl body-14 leading-none font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/35 disabled:opacity-50 disabled:pointer-events-none',
    variantClass[variant],
    sizeClass[size],
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }: ButtonProps) {
  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children as React.ReactElement, {
      className: cn(buttonVariants({ variant, size }), (props.children as React.ReactElement<{ className?: string }>).props.className, className),
    });
  }

  return <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
