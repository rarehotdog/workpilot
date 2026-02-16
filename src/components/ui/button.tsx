import * as React from 'react';
import { cn } from './utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

const variantClass: Record<ButtonVariant, string> = {
  default: 'bg-gray-900 text-white hover:bg-gray-800',
  destructive: 'bg-red-500 text-white hover:bg-red-600',
  outline: 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  ghost: 'text-gray-700 hover:bg-gray-100',
  link: 'text-blue-600 underline-offset-4 hover:underline',
};

const sizeClass: Record<ButtonSize, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-11 px-6',
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
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
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
