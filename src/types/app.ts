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
