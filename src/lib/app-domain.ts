import type { TechTreeResponse } from './gemini';
import type {
  FailureLogEntry,
  FailureRootCause,
  Quest,
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
