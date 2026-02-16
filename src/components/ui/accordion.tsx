import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './utils';

type AccordionType = 'single' | 'multiple';

type AccordionContextValue = {
  type: AccordionType;
  openValues: string[];
  toggleValue: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<{ value: string } | null>(null);

function useAccordionContext() {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion sub-components must be used within <Accordion>.');
  }
  return context;
}

function useAccordionItemContext() {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionTrigger/Content must be used within <AccordionItem>.');
  }
  return context;
}

export function Accordion({
  type = 'single',
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
}) {
  const normalizedDefault = React.useMemo(() => {
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  }, [defaultValue]);

  const [internalValues, setInternalValues] = React.useState<string[]>(normalizedDefault);
  const controlledValues = React.useMemo(() => {
    if (value === undefined) return undefined;
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const openValues = controlledValues ?? internalValues;

  const toggleValue = (nextValue: string) => {
    const hasValue = openValues.includes(nextValue);
    let nextValues: string[];

    if (type === 'single') {
      if (hasValue && collapsible) {
        nextValues = [];
      } else if (hasValue) {
        nextValues = [nextValue];
      } else {
        nextValues = [nextValue];
      }
    } else if (hasValue) {
      nextValues = openValues.filter((v) => v !== nextValue);
    } else {
      nextValues = [...openValues, nextValue];
    }

    if (controlledValues === undefined) {
      setInternalValues(nextValues);
    }

    if (onValueChange) {
      onValueChange(type === 'single' ? (nextValues[0] ?? '') : nextValues);
    }
  };

  return (
    <AccordionContext.Provider value={{ type, openValues, toggleValue }}>
      <div data-slot="accordion" {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children, ...props }: React.ComponentProps<'div'> & { value: string }) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div data-slot="accordion-item" className={cn('border-b border-gray-200 last:border-b-0', className)} {...props}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<'button'>) {
  const { toggleValue, openValues } = useAccordionContext();
  const { value } = useAccordionItemContext();
  const isOpen = openValues.includes(value);

  return (
    <div className="flex" data-slot="accordion-header">
      <button
        type="button"
        data-slot="accordion-trigger"
        aria-expanded={isOpen}
        className={cn(
          'flex flex-1 items-start justify-between gap-4 py-4 text-left text-sm font-medium transition-all hover:underline',
          className,
        )}
        onClick={() => toggleValue(value)}
        {...props}
      >
        {children}
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')} />
      </button>
    </div>
  );
}

export function AccordionContent({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { openValues } = useAccordionContext();
  const { value } = useAccordionItemContext();

  if (!openValues.includes(value)) return null;

  return (
    <div data-slot="accordion-content" className={cn('overflow-hidden text-sm', className)} {...props}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  );
}
