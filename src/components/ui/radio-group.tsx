import * as React from 'react';
import { cn } from './utils';

type RadioGroupContextValue = {
  value?: string;
  setValue: (value: string) => void;
  disabled?: boolean;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

function useRadioGroupContext() {
  const context = React.useContext(RadioGroupContext);
  if (!context) {
    throw new Error('RadioGroupItem must be used within RadioGroup.');
  }
  return context;
}

export function RadioGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [internalValue, setInternalValue] = React.useState<string | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <RadioGroupContext.Provider value={{ value: resolvedValue, setValue, disabled }}>
      <div data-slot="radio-group" role="radiogroup" className={cn('grid gap-3', className)} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export function RadioGroupItem({
  className,
  value,
  disabled,
  ...props
}: Omit<React.ComponentProps<'button'>, 'value'> & { value: string }) {
  const context = useRadioGroupContext();
  const isSelected = context.value === value;
  const isDisabled = disabled || context.disabled;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      data-slot="radio-group-item"
      onClick={() => {
        if (!isDisabled) context.setValue(value);
      }}
      disabled={isDisabled}
      className={cn(
        'relative h-4 w-4 rounded-full border transition-colors disabled:opacity-50',
        isSelected ? 'border-blue-600' : 'border-gray-300',
        className,
      )}
      {...props}
    >
      {isSelected ? <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600" /> : null}
    </button>
  );
}
