import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from './utils';

export function Checkbox({
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
      role="checkbox"
      aria-checked={resolvedChecked}
      data-slot="checkbox"
      onClick={toggle}
      disabled={disabled}
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded border text-white shadow-sm transition-colors disabled:opacity-50',
        resolvedChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white',
        className,
      )}
      {...props}
    >
      {resolvedChecked ? <Check className="h-3 w-3" /> : null}
    </button>
  );
}
