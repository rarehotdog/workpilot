import * as React from 'react';
import { Minus } from 'lucide-react';
import { cn } from './utils';

type InputOTPContextValue = {
  value: string;
  maxLength: number;
};

const InputOTPContext = React.createContext<InputOTPContextValue | null>(null);

function useInputOTPContext() {
  const context = React.useContext(InputOTPContext);
  if (!context) {
    throw new Error('InputOTPSlot must be used within <InputOTP>.');
  }
  return context;
}

export function InputOTP({
  className,
  containerClassName,
  value = '',
  maxLength = 6,
  children,
  ...props
}: React.ComponentProps<'input'> & {
  containerClassName?: string;
  value?: string;
  maxLength?: number;
}) {
  return (
    <InputOTPContext.Provider value={{ value, maxLength }}>
      <div data-slot="input-otp" className={cn('flex items-center gap-2', containerClassName)}>
        {children ?? (
          <input
            className={cn('h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-purple-300', className)}
            value={value}
            maxLength={maxLength}
            {...props}
          />
        )}
      </div>
    </InputOTPContext.Provider>
  );
}

export function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-otp-group" className={cn('flex items-center gap-1', className)} {...props} />;
}

export function InputOTPSlot({ index, className, ...props }: React.ComponentProps<'div'> & { index: number }) {
  const { value, maxLength } = useInputOTPContext();
  const char = value[index] ?? '';
  const isActive = !char && index === Math.min(value.length, maxLength - 1);

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn('relative flex h-9 w-9 items-center justify-center border border-gray-300 bg-white text-sm first:rounded-l-md last:rounded-r-md', isActive ? 'ring-2 ring-purple-300' : '', className)}
      {...props}
    >
      {char}
      {isActive ? <div className="pointer-events-none absolute h-4 w-px animate-pulse bg-gray-900" /> : null}
    </div>
  );
}

export function InputOTPSeparator(props: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <Minus className="h-4 w-4" />
    </div>
  );
}
