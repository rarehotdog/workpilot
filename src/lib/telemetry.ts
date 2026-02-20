import { isFlagEnabled } from '../config/flags';
import type { AppEvent, DecisionQualitySnapshot } from '../types/app';

interface TimingAttributes {
  [key: string]: string | number | boolean | null | undefined;
}

declare global {
  interface Window {
    Sentry?: {
      captureException: (error: unknown, context?: unknown) => void;
      captureMessage: (message: string, level?: string) => void;
      addBreadcrumb?: (breadcrumb: Record<string, unknown>) => void;
    };
  }
}

const TELEMETRY_QUEUE_LIMIT = 200;
const TELEMETRY_BUFFER: AppEvent[] = [];

function shouldTrack(): boolean {
  return isFlagEnabled('telemetry_v1');
}

function pushEvent(event: AppEvent): void {
  TELEMETRY_BUFFER.push(event);
  if (TELEMETRY_BUFFER.length > TELEMETRY_QUEUE_LIMIT) {
    TELEMETRY_BUFFER.shift();
  }
}

function serializeAttributes(attributes?: TimingAttributes): Record<string, string | number | boolean | null> | undefined {
  if (!attributes) return undefined;

  const result: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined) continue;
    result[key] = value;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function getTelemetryBuffer(): AppEvent[] {
  return [...TELEMETRY_BUFFER];
}

export function trackEvent(name: AppEvent['name'], attributes?: TimingAttributes): void {
  if (!shouldTrack()) return;

  const event: AppEvent = {
    name,
    level: 'info',
    timestamp: new Date().toISOString(),
    attributes: serializeAttributes(attributes),
  };

  pushEvent(event);
  window.Sentry?.addBreadcrumb?.({
    category: 'event',
    level: 'info',
    message: name,
    data: event.attributes,
  });
}

export function trackError(error: unknown, attributes?: TimingAttributes): void {
  if (!shouldTrack()) return;

  const event: AppEvent = {
    name: 'app.error',
    level: 'error',
    timestamp: new Date().toISOString(),
    attributes: serializeAttributes(attributes),
  };

  pushEvent(event);

  if (window.Sentry?.captureException) {
    window.Sentry.captureException(error, {
      tags: event.attributes,
    });
    return;
  }

  if (error instanceof Error) {
    console.error('[telemetry]', error.message, event.attributes ?? {});
  } else {
    console.error('[telemetry]', error, event.attributes ?? {});
  }
}

export function trackTiming(name: string, durationMs: number, attributes?: TimingAttributes): void {
  if (!shouldTrack()) return;

  const event: AppEvent = {
    name,
    level: 'info',
    timestamp: new Date().toISOString(),
    durationMs,
    attributes: serializeAttributes(attributes),
  };

  pushEvent(event);
  window.Sentry?.addBreadcrumb?.({
    category: 'timing',
    level: 'info',
    message: name,
    data: {
      durationMs,
      ...(event.attributes ?? {}),
    },
  });
}

export function trackDecisionQuality(snapshot: DecisionQualitySnapshot): void {
  trackEvent('decision.quality_scored', {
    score: snapshot.score,
    structureScore: snapshot.structureScore,
    executionScore: snapshot.executionScore,
    recoveryScore: snapshot.recoveryScore,
    safetyScore: snapshot.safetyScore,
  });
}
