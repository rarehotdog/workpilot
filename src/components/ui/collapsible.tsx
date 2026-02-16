import * as React from 'react';

type CollapsibleContextValue = {
  open: boolean;
  setOpen: (next: boolean) => void;
};

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible components must be used within <Collapsible>.');
  }
  return context;
}

export function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: React.PropsWithChildren<{ open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return <CollapsibleContext.Provider value={{ open: resolvedOpen, setOpen }}>{children}</CollapsibleContext.Provider>;
}

export function CollapsibleTrigger({ onClick, ...props }: React.ComponentProps<'button'>) {
  const { open, setOpen } = useCollapsibleContext();
  return (
    <button
      data-slot="collapsible-trigger"
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    />
  );
}

export function CollapsibleContent({ children, ...props }: React.ComponentProps<'div'>) {
  const { open } = useCollapsibleContext();
  if (!open) return null;
  return <div data-slot="collapsible-content" {...props}>{children}</div>;
}
