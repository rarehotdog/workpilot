export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | ClassValue[];

function pushValue(value: ClassValue, out: string[]): void {
  if (!value) return;

  if (typeof value === 'string' || typeof value === 'number') {
    out.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) pushValue(item, out);
    return;
  }

  if (typeof value === 'object') {
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) out.push(key);
    }
  }
}

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];
  for (const value of inputs) pushValue(value, classes);
  return [...new Set(classes)].join(' ').trim();
}
