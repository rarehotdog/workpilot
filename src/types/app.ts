export type Screen = 'onboarding' | 'home' | 'techTree' | 'progress' | 'profile';

export type QuestTimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface UserProfile {
  name: string;
  goal: string;
  deadline: string;
  routineTime: string;
  constraints: string;
  currentDay: number;
  streak: number;
  weeklyCompletion: number;
  estimatedGoalDate: string;
  joinedDate: string;
  daysUntilDeadline?: number;
}

export interface Quest {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  alternative?: string;
  timeOfDay: QuestTimeOfDay;
  description?: string;
}

export type FailureReasonCode = 'time' | 'motivation' | 'difficulty' | 'environment' | 'health' | 'other';

export type FailureRootCause = 'time' | 'motivation' | 'difficulty' | 'environment' | 'other';

export interface IntentState {
  goal: string;
  values: string[];
  constraints: string[];
  timeHorizon: string;
  updatedAt: string;
  source: 'onboarding' | 'manual' | 'ai';
}

export type DecisionEvidenceSourceKind = 'calendar' | 'task' | 'note' | 'voice' | 'manual';

export interface DecisionEvidence {
  id: string;
  title: string;
  sourceKind: DecisionEvidenceSourceKind;
  sourceRef: string;
  capturedAt: string;
}

export interface DecisionOption {
  id: string;
  title: string;
  estimatedCost: number;
  estimatedBenefit: number;
  counterArguments: string[];
  recommended: boolean;
}

export interface DecisionRecord {
  id: string;
  intentId: string;
  question: string;
  options: DecisionOption[];
  evidence: DecisionEvidence[];
  selectedOptionId: string;
  createdAt: string;
}

export type ExecutionStatus = 'applied' | 'delayed' | 'skipped';

export interface ExecutionRecord {
  id: string;
  decisionId: string;
  actionType: string;
  scheduledAt: string;
  executedAt: string;
  status: ExecutionStatus;
  delayMinutes: number;
}

export type GovernanceRiskLevel = 'low' | 'medium' | 'high';

export interface GovernanceAuditLog {
  id: string;
  eventType: string;
  scope: string;
  riskLevel: GovernanceRiskLevel;
  approved: boolean;
  timestamp: string;
}

export interface DecisionQualitySnapshot {
  timestamp: string;
  score: number;
  structureScore: number;
  executionScore: number;
  recoveryScore: number;
  safetyScore: number;
}

export interface ExecutionMetrics {
  windowDays: number;
  total: number;
  appliedCount: number;
  delayedCount: number;
  skippedCount: number;
  appliedRate: number;
  delayedRate: number;
  onTimeRate: number;
}

export interface SafetyMetrics {
  windowDays: number;
  totalAudits: number;
  riskCounts: Record<GovernanceRiskLevel, number>;
  highRiskViolations: number;
  highRiskViolationRate: number;
}

export type GoldenSetCategory =
  | 'A_accuracy'
  | 'B_decision_quality'
  | 'C_execution'
  | 'D_safety';

export interface GoldenSetCase {
  id: string;
  category: GoldenSetCategory;
  prompt: string;
  expected: Record<string, unknown>;
  observed?: Record<string, unknown>;
  createdAt: string;
  source: 'curated' | 'real_decision';
  tags?: string[];
}

export interface GoldenSetResult {
  runAt: string;
  total: number;
  passed: number;
  failed: number;
  byCategory: Record<GoldenSetCategory, { total: number; passed: number }>;
  failures: Array<{ caseId: string; category: GoldenSetCategory; reason: string }>;
}

export interface FailureLogEntry {
  timestamp: string;
  questId: string;
  questTitle: string;
  reasonCode: FailureReasonCode;
  reasonText: string;
  rootCause: FailureRootCause;
  energy?: number;
}

export interface VoiceCheckInEntry {
  text: string;
  createdAt: string;
}

export type StorageSchemaVersion = 1 | 2 | 3;

export type SyncOperationType =
  | 'save_profile'
  | 'save_quests'
  | 'save_tech_tree'
  | 'save_quest_history';

export interface SyncOutboxItem {
  id: string;
  operation: SyncOperationType;
  idempotencyKey: string;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError?: string;
}

export type AppEventLevel = 'info' | 'warn' | 'error';

export interface AppEvent {
  name:
    | 'app.bootstrap'
    | 'app.error'
    | 'quest.toggled'
    | 'quest.completed_all'
    | 'quest.failed'
    | 'quest.recovery_accepted'
    | 'ai.generate_quests'
    | 'ai.generate_quests_failed'
    | 'ai.generate_tree'
    | 'ai.generate_tree_failed'
    | 'sync.outbox_enqueued'
    | 'sync.outbox_drain'
    | 'intent.state_updated'
    | 'decision.generated'
    | 'decision.selected'
    | 'decision.quality_scored'
    | 'execution.applied'
    | 'execution.delayed'
    | 'execution.skipped'
    | 'governance.permission_prompted'
    | 'governance.permission_granted'
    | 'governance.permission_denied'
    | 'governance.risk_flagged'
    | 'goldenset.regression_run'
    | 'goldenset.case_added'
    | 'ui.modal_opened'
    | 'ui.modal_closed'
    | string;
  timestamp: string;
  level: AppEventLevel;
  attributes?: Record<string, string | number | boolean | null>;
  durationMs?: number;
}
