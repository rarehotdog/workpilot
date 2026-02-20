import type { TechTreeResponse } from './gemini';
import type {
  DecisionQualitySnapshot,
  DecisionRecord,
  ExecutionMetrics,
  ExecutionRecord,
  FailureLogEntry,
  FailureRootCause,
  GovernanceAuditLog,
  Quest,
  QuestTimeOfDay,
  SafetyMetrics,
  UserProfile,
} from '../types/app';

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function createDefaultProfile(): UserProfile {
  return {
    name: '게스트',
    goal: '하루 하루 성장하기',
    deadline: '무제한',
    routineTime: 'morning',
    constraints: '없음',
    currentDay: 1,
    streak: 0,
    weeklyCompletion: 0,
    estimatedGoalDate: '지속적',
    joinedDate: getTodayString(),
  };
}

export function createDefaultQuests(): Quest[] {
  return [
    {
      id: '1',
      title: '오늘의 목표 설정하기',
      duration: '5분',
      completed: false,
      timeOfDay: 'morning',
      description: '하루를 시작하기 전 목표를 정해보세요',
    },
    {
      id: '2',
      title: '집중 시간 갖기',
      duration: '25분',
      completed: false,
      timeOfDay: 'afternoon',
      description: '포모도로 타이머로 집중해보세요',
    },
    {
      id: '3',
      title: '하루 되돌아보기',
      duration: '10분',
      completed: false,
      timeOfDay: 'evening',
      description: '오늘 무엇을 이뤘는지 기록해보세요',
    },
  ];
}

interface DeterministicQuestContext {
  date?: string;
  energy?: number;
  voiceHint?: string;
}

function stableHash(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function pickBySeed<T>(values: T[], seed: number, offset = 0): T {
  const index = (seed + offset) % values.length;
  return values[index];
}

const QUEST_TEMPLATES: Record<
  string,
  { title: string; description: string; duration: string; timeOfDay: QuestTimeOfDay }[]
> = {
  growth: [
    {
      title: '핵심 목표 1문장 정리하기',
      description: '오늘의 방향을 명확히 정리해 결정 피로를 줄입니다.',
      duration: '10분',
      timeOfDay: 'morning',
    },
    {
      title: '집중 블록 1회 실행',
      description: '가장 중요한 한 가지를 25분 동안 밀어붙입니다.',
      duration: '25분',
      timeOfDay: 'afternoon',
    },
    {
      title: '오늘 실행 회고 3줄',
      description: '완료/실패/개선점을 짧게 기록합니다.',
      duration: '10분',
      timeOfDay: 'evening',
    },
  ],
  fitness: [
    {
      title: '워밍업 스트레칭',
      description: '몸 상태를 확인하며 낮은 강도로 시작합니다.',
      duration: '10분',
      timeOfDay: 'morning',
    },
    {
      title: '주요 운동 루틴 1세트',
      description: '무리하지 않고 폼에 집중해 수행합니다.',
      duration: '25분',
      timeOfDay: 'afternoon',
    },
    {
      title: '회복 루틴/수분 체크',
      description: '회복 상태와 수분 섭취를 체크합니다.',
      duration: '10분',
      timeOfDay: 'evening',
    },
  ],
  study: [
    {
      title: '핵심 개념 1개 요약',
      description: '오늘 학습할 핵심 개념을 짧게 정리합니다.',
      duration: '10분',
      timeOfDay: 'morning',
    },
    {
      title: '문제 풀이 집중 세션',
      description: '정해진 시간 내 문제 풀이에 집중합니다.',
      duration: '30분',
      timeOfDay: 'afternoon',
    },
    {
      title: '오답/학습 로그 기록',
      description: '내일 이어갈 학습 포인트를 남깁니다.',
      duration: '10분',
      timeOfDay: 'evening',
    },
  ],
};

function inferGoalTemplate(profile: UserProfile): keyof typeof QUEST_TEMPLATES {
  const text = `${profile.goal} ${profile.constraints}`.toLowerCase();
  if (text.includes('운동') || text.includes('건강') || text.includes('체력')) return 'fitness';
  if (text.includes('공부') || text.includes('시험') || text.includes('학습') || text.includes('코딩')) return 'study';
  return 'growth';
}

export function createDeterministicFallbackQuests(
  profile: UserProfile,
  context?: DeterministicQuestContext,
): Quest[] {
  const templateKey = inferGoalTemplate(profile);
  const templates = QUEST_TEMPLATES[templateKey];
  const date = context?.date ?? getTodayString();
  const seed = stableHash(`${profile.name}:${profile.goal}:${date}`);
  const lowEnergy = typeof context?.energy === 'number' && context.energy <= 2;
  const voiceLowSignal = context?.voiceHint
    ? ['피곤', '지침', '무기력', '힘들'].some((signal) =>
        context.voiceHint?.toLowerCase().includes(signal),
      )
    : false;

  const quests = templates.map((_, index) => {
    const picked = pickBySeed(templates, seed, index);
    const shouldLighten = index === 0 && (lowEnergy || voiceLowSignal);
    const duration = shouldLighten ? '5분' : picked.duration;
    const description = shouldLighten
      ? `${picked.description} 저에너지 모드로 축소했습니다.`
      : picked.description;

    return {
      id: String(index + 1),
      title: picked.title,
      duration,
      completed: false,
      timeOfDay: picked.timeOfDay,
      description,
      alternative: shouldLighten ? '2분만 착수하기' : '5~10분 축소 버전으로 시작하기',
    } satisfies Quest;
  });

  return quests;
}

export function parseMinutes(duration: string): number | null {
  const match = duration.match(/(\d+)/);
  if (!match) return null;

  return Number.parseInt(match[1], 10);
}

export function extractVoiceEnergyHint(text: string): number | undefined {
  const lowerCaseText = text.toLowerCase();
  const lowSignals = ['피곤', '지침', '힘들', '기운이 없', '무기력', '바빠', '스트레스'];
  const highSignals = ['상쾌', '집중 잘', '컨디션 좋', '에너지 좋', '의욕', '할 수 있'];

  if (lowSignals.some((signal) => lowerCaseText.includes(signal))) return 2;
  if (highSignals.some((signal) => lowerCaseText.includes(signal))) return 4;

  return undefined;
}

export function getRecentFailurePatternLabel(logs: FailureLogEntry[]): string | undefined {
  if (!logs.length) return undefined;

  const counts: Record<FailureLogEntry['rootCause'], number> = {
    time: 0,
    motivation: 0,
    difficulty: 0,
    environment: 0,
    other: 0,
  };

  for (const log of logs.slice(0, 20)) {
    counts[log.rootCause] += 1;
  }

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as
    | FailureLogEntry['rootCause']
    | undefined;

  const labels: Record<FailureLogEntry['rootCause'], string> = {
    time: '시간 압박',
    motivation: '동기 저하',
    difficulty: '난이도 과부하',
    environment: '환경 제약',
    other: '기타',
  };

  if (!top || counts[top] === 0) return undefined;

  return labels[top];
}

export function advanceTechTree(tree: TechTreeResponse): TechTreeResponse {
  const clonedTree = structuredClone(tree);
  if (!clonedTree.root.children) return clonedTree;

  for (const phase of clonedTree.root.children) {
    if (phase.status !== 'in_progress' || !phase.children) {
      continue;
    }

    for (let index = 0; index < phase.children.length; index += 1) {
      if (phase.children[index].status !== 'in_progress') continue;

      phase.children[index].status = 'completed';

      if (index + 1 < phase.children.length && phase.children[index + 1].status === 'locked') {
        phase.children[index + 1].status = 'in_progress';
      }

      break;
    }

    if (phase.children.every((questNode) => questNode.status === 'completed')) {
      phase.status = 'completed';
      const phaseIndex = clonedTree.root.children.indexOf(phase);
      const nextPhase = clonedTree.root.children[phaseIndex + 1];

      if (nextPhase) {
        nextPhase.status = 'in_progress';
        if (nextPhase.children?.[0]) {
          nextPhase.children[0].status = 'in_progress';
        }
      }
    }

    break;
  }

  if (clonedTree.root.children.every((phase) => phase.status === 'completed')) {
    clonedTree.root.status = 'completed';
  }

  return clonedTree;
}

export function rerouteTechTreeForRecovery(
  tree: TechTreeResponse,
  rootCause: FailureRootCause,
): TechTreeResponse {
  const clonedTree = structuredClone(tree);
  const phase = clonedTree.root.children?.find(
    (candidate) => candidate.status === 'in_progress' && candidate.children?.length,
  );

  if (!phase?.children) return clonedTree;

  const activeIndex = phase.children.findIndex((questNode) => questNode.status === 'in_progress');
  const lockedIndex = phase.children.findIndex((questNode) => questNode.status === 'locked');

  if (activeIndex < 0 || lockedIndex < 0) return clonedTree;

  if (rootCause === 'difficulty' || rootCause === 'time' || rootCause === 'environment') {
    phase.children[activeIndex].status = 'locked';
    phase.children[lockedIndex].status = 'in_progress';
  }

  if (phase.children.every((questNode) => questNode.status === 'completed')) {
    phase.status = 'completed';
  } else {
    phase.status = 'in_progress';
  }

  return clonedTree;
}

export function validateDecisionRecord(record: DecisionRecord): {
  pass: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (record.options.length < 3) {
    reasons.push('options must be at least 3');
  }

  const counterInvalid = record.options.some(
    (option) => option.counterArguments.length < 2,
  );
  if (counterInvalid) {
    reasons.push('each option must contain at least 2 counter arguments');
  }

  if (record.evidence.length < 3) {
    reasons.push('evidence must be at least 3');
  }

  return {
    pass: reasons.length === 0,
    reasons,
  };
}

export function computeExecutionMetrics(
  records: ExecutionRecord[],
  days = 7,
): ExecutionMetrics {
  const now = Date.now();
  const windowMs = days * 24 * 60 * 60 * 1000;
  const inWindow = records.filter((record) => {
    const executedAt = Date.parse(record.executedAt);
    if (Number.isNaN(executedAt)) return false;
    return now - executedAt <= windowMs;
  });

  const total = inWindow.length;
  const appliedCount = inWindow.filter((record) => record.status === 'applied').length;
  const delayedCount = inWindow.filter((record) => record.status === 'delayed').length;
  const skippedCount = inWindow.filter((record) => record.status === 'skipped').length;

  const onTimeCount = inWindow.filter((record) => record.delayMinutes <= 0).length;

  return {
    windowDays: days,
    total,
    appliedCount,
    delayedCount,
    skippedCount,
    appliedRate: total > 0 ? appliedCount / total : 0,
    delayedRate: total > 0 ? delayedCount / total : 0,
    onTimeRate: total > 0 ? onTimeCount / total : 0,
  };
}

export function computeSafetyMetrics(
  auditLogs: GovernanceAuditLog[],
  days = 7,
): SafetyMetrics {
  const now = Date.now();
  const windowMs = days * 24 * 60 * 60 * 1000;
  const inWindow = auditLogs.filter((log) => {
    const timestamp = Date.parse(log.timestamp);
    if (Number.isNaN(timestamp)) return false;
    return now - timestamp <= windowMs;
  });

  const riskCounts = inWindow.reduce<Record<'low' | 'medium' | 'high', number>>(
    (accumulator, log) => {
      accumulator[log.riskLevel] += 1;
      return accumulator;
    },
    {
      low: 0,
      medium: 0,
      high: 0,
    },
  );

  const highRiskViolations = inWindow.filter(
    (log) => log.riskLevel === 'high' && !log.approved,
  ).length;

  return {
    windowDays: days,
    totalAudits: inWindow.length,
    riskCounts,
    highRiskViolations,
    highRiskViolationRate:
      inWindow.length > 0 ? highRiskViolations / inWindow.length : 0,
  };
}

export function calculateDecisionQuality(input: {
  decisionRecords: DecisionRecord[];
  executionMetrics: ExecutionMetrics;
  recoveryAcceptRate: number;
  rerouteSuccessRate: number;
  safetyMetrics: SafetyMetrics;
  timestamp?: string;
}): DecisionQualitySnapshot {
  const validDecisionCount = input.decisionRecords.filter(
    (record) => validateDecisionRecord(record).pass,
  ).length;
  const structureRatio =
    input.decisionRecords.length > 0
      ? validDecisionCount / input.decisionRecords.length
      : 1;

  const structureScore = Math.round(Math.max(0, Math.min(40, structureRatio * 40)));

  const executionScore = Math.round(
    Math.max(
      0,
      Math.min(
        35,
        input.executionMetrics.appliedRate * 20 +
          input.executionMetrics.onTimeRate * 15,
      ),
    ),
  );

  const recoveryScore = Math.round(
    Math.max(
      0,
      Math.min(15, input.recoveryAcceptRate * 10 + input.rerouteSuccessRate * 5),
    ),
  );

  const safetyScore = Math.round(
    Math.max(
      0,
      Math.min(10, 10 - input.safetyMetrics.highRiskViolationRate * 10),
    ),
  );

  const score = Math.max(
    0,
    Math.min(100, structureScore + executionScore + recoveryScore + safetyScore),
  );

  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    score,
    structureScore,
    executionScore,
    recoveryScore,
    safetyScore,
  };
}
