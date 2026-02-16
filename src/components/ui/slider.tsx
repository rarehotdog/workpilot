import * as React from 'react';
import { cn } from './utils';

export function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange' | 'min' | 'max'> & {
  defaultValue?: number[];
  value?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
}) {
  const resolvedValue = value?.[0] ?? defaultValue?.[0] ?? min;

  return (
    <input
      type="range"
      data-slot="slider"
      min={min}
      max={max}
      step={step}
      value={resolvedValue}
      className={cn('h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600', className)}
      onChange={(event) => {
        onValueChange?.([Number(event.target.value)]);
      }}
      {...props}
    />
  );
}
