import { vi } from 'vitest';

export function makeJsonRequest(
  path: string,
  body: unknown,
  options?: {
    method?: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    requestId?: string;
  },
): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: options?.method ?? 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': options?.requestId ?? 'test-request-id',
    },
    body: JSON.stringify(body),
  });
}

export function makeFormRequest(
  path: string,
  formData: FormData,
  options?: {
    method?: 'POST' | 'PATCH' | 'PUT';
    requestId?: string;
  },
): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: options?.method ?? 'POST',
    headers: {
      'x-request-id': options?.requestId ?? 'test-request-id',
    },
    body: formData,
  });
}

export async function jsonOf<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function resetTestMocks(): void {
  vi.clearAllMocks();
}

export function makeFileOfSize(sizeBytes: number, name: string, mimeType: string): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: mimeType });
}
