import * as React from 'react';

export type ToasterProps = React.ComponentProps<'div'> & {
  theme?: 'light' | 'dark' | 'system';
};

export function Toaster({ theme = 'system', className, ...props }: ToasterProps) {
  return <div data-slot="toaster" data-theme={theme} className={className} {...props} />;
}
