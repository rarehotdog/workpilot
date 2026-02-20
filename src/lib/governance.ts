import type { GovernanceAuditLog, GovernanceRiskLevel } from '../types/app';

export type GovernanceScope =
  | 'calendar'
  | 'task'
  | 'message'
  | 'health'
  | 'email'
  | 'finance'
  | 'profile'
  | 'decision'
  | 'generic';

export function evaluateRisk(scope: GovernanceScope): GovernanceRiskLevel {
  if (scope === 'email' || scope === 'finance') return 'high';
  if (scope === 'health' || scope === 'message' || scope === 'calendar') return 'medium';
  return 'low';
}

export function requiresExplicitApproval(scope: GovernanceScope): boolean {
  return evaluateRisk(scope) !== 'low';
}

export function buildAuditEvent(input: {
  eventType: string;
  scope: GovernanceScope;
  approved: boolean;
  timestamp?: string;
}): GovernanceAuditLog {
  const timestamp = input.timestamp ?? new Date().toISOString();

  return {
    id: `${input.scope}:${input.eventType}:${timestamp}`,
    eventType: input.eventType,
    scope: input.scope,
    riskLevel: evaluateRisk(input.scope),
    approved: input.approved,
    timestamp,
  };
}
