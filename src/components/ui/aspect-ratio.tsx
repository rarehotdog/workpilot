import * as React from 'react';

export function AspectRatio({
  ratio = 1,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & { ratio?: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: String(ratio),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
