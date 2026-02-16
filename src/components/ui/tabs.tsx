import * as React from 'react';
import { cn } from './utils';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within <Tabs>.');
  return context;
}

export function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const resolvedValue = isControlled ? value : internalValue;

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value: resolvedValue, setValue }}>
      <div data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="tabs-list" role="tablist" className={cn('inline-flex h-9 w-fit items-center justify-center rounded-xl bg-gray-100 p-[3px]', className)} {...props} />;
}

export function TabsTrigger({ className, value, onClick, ...props }: React.ComponentProps<'button'> & { value: string }) {
  const { value: selectedValue, setValue } = useTabsContext();
  const isActive = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium transition-colors',
        isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        setValue(value);
      }}
      {...props}
    />
  );
}

export function TabsContent({ className, value, ...props }: React.ComponentProps<'div'> & { value: string }) {
  const { value: selectedValue } = useTabsContext();
  if (selectedValue !== value) return null;
  return <div data-slot="tabs-content" role="tabpanel" className={cn('flex-1 outline-none', className)} {...props} />;
}
