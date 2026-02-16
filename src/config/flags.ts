import { STORAGE_KEYS, getItemString, setItemString } from '../lib/app-storage';

export type FeatureFlagKey = 'reliable_storage_v2' | 'ai_guardrails_v2' | 'telemetry_v1';

export interface FeatureFlagConfig {
  enabled: boolean;
  rollout: number; // 0-100
}

const DEFAULT_FLAGS: Record<FeatureFlagKey, FeatureFlagConfig> = {
  reliable_storage_v2: {
    enabled: true,
    rollout: Number(import.meta.env.VITE_FLAG_RELIABLE_STORAGE_V2_ROLLOUT ?? 100),
  },
  ai_guardrails_v2: {
    enabled: true,
    rollout: Number(import.meta.env.VITE_FLAG_AI_GUARDRAILS_V2_ROLLOUT ?? 100),
  },
  telemetry_v1: {
    enabled: true,
    rollout: Number(import.meta.env.VITE_FLAG_TELEMETRY_V1_ROLLOUT ?? 100),
  },
};

function clampRollout(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.floor(value)));
}

function hashToBucket(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % 100;
}

function getOrCreateCohortSeed(): string {
  const existing = getItemString(STORAGE_KEYS.rolloutSeed);
  if (existing) return existing;

  const generated = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

  setItemString(STORAGE_KEYS.rolloutSeed, generated);
  return generated;
}

export function getFeatureFlagConfig(key: FeatureFlagKey): FeatureFlagConfig {
  const config = DEFAULT_FLAGS[key];
  return {
    enabled: config.enabled,
    rollout: clampRollout(config.rollout),
  };
}

export function isFlagEnabled(key: FeatureFlagKey): boolean {
  const config = getFeatureFlagConfig(key);
  if (!config.enabled) return false;

  if (config.rollout >= 100) return true;
  if (config.rollout <= 0) return false;

  const seed = getOrCreateCohortSeed();
  const bucket = hashToBucket(`${key}:${seed}`);
  return bucket < config.rollout;
}
