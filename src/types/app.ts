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

export type StorageSchemaVersion = 1 | 2;

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
    | 'ui.modal_opened'
    | 'ui.modal_closed'
    | string;
  timestamp: string;
  level: AppEventLevel;
  attributes?: Record<string, string | number | boolean | null>;
  durationMs?: number;
}
