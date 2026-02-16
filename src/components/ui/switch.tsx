import * as React from 'react';
import { cn } from './utils';

export function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onChange'> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
  const isControlled = checked !== undefined;
  const resolvedChecked = isControlled ? checked : internalChecked;

  const toggle = () => {
    if (disabled) return;
    const next = !resolvedChecked;
    if (!isControlled) setInternalChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedChecked}
      data-slot="switch"
      onClick={toggle}
      disabled={disabled}
      className={cn(
        'inline-flex h-5 w-9 items-center rounded-full border border-transparent transition-colors disabled:opacity-50',
        resolvedChecked ? 'bg-blue-600' : 'bg-gray-300',
        className,
      )}
      {...props}
    >
      <span
        data-slot="switch-thumb"
        className={cn(
          'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform',
          resolvedChecked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
