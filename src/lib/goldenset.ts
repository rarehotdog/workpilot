import { validateDecisionRecord } from './app-domain';
import type {
  DecisionRecord,
  ExecutionMetrics,
  GoldenSetCase,
  GoldenSetCategory,
  GoldenSetResult,
  SafetyMetrics,
} from '../types/app';

const CATEGORIES: GoldenSetCategory[] = [
  'A_accuracy',
  'B_decision_quality',
  'C_execution',
  'D_safety',
];

function defaultCategoryResult(): Record<GoldenSetCategory, { total: number; passed: number }> {
  return {
    A_accuracy: { total: 0, passed: 0 },
    B_decision_quality: { total: 0, passed: 0 },
    C_execution: { total: 0, passed: 0 },
    D_safety: { total: 0, passed: 0 },
  };
}

function asNumber(value: unknown): number | null {
  if (typeof value !== 'number') return null;
  if (Number.isNaN(value)) return null;
  return value;
}

function evaluateAccuracyCase(testCase: GoldenSetCase): { pass: boolean; reason?: string } {
  const requiredItems = asNumber(testCase.expected.requiredItems);
  const observedItems = asNumber(testCase.observed?.itemsFound);

  if (requiredItems === null || observedItems === null) {
    return {
      pass: false,
      reason: 'missing requiredItems/itemsFound',
    };
  }

  return {
    pass: observedItems >= requiredItems,
    reason:
      observedItems >= requiredItems
        ? undefined
        : `itemsFound ${observedItems} < requiredItems ${requiredItems}`,
  };
}

function evaluateDecisionCase(
  testCase: GoldenSetCase,
  decisionRecords: DecisionRecord[],
): { pass: boolean; reason?: string } {
  const targetId = typeof testCase.expected.decisionRecordId === 'string'
    ? testCase.expected.decisionRecordId
    : undefined;
  const record = targetId
    ? decisionRecords.find((item) => item.id === targetId)
    : decisionRecords[0];

  if (!record) {
    return {
      pass: false,
      reason: 'no decision record available',
    };
  }

  const validation = validateDecisionRecord(record);
  return {
    pass: validation.pass,
    reason: validation.pass ? undefined : validation.reasons.join(', '),
  };
}

function evaluateExecutionCase(
  testCase: GoldenSetCase,
  executionMetrics: ExecutionMetrics,
): { pass: boolean; reason?: string } {
  const minAppliedRate = asNumber(testCase.expected.minAppliedRate) ?? 0;
  const maxDelayedRate = asNumber(testCase.expected.maxDelayedRate) ?? 1;

  if (executionMetrics.appliedRate < minAppliedRate) {
    return {
      pass: false,
      reason: `appliedRate ${executionMetrics.appliedRate.toFixed(2)} < ${minAppliedRate.toFixed(2)}`,
    };
  }

  if (executionMetrics.delayedRate > maxDelayedRate) {
    return {
      pass: false,
      reason: `delayedRate ${executionMetrics.delayedRate.toFixed(2)} > ${maxDelayedRate.toFixed(2)}`,
    };
  }

  return { pass: true };
}

function evaluateSafetyCase(
  testCase: GoldenSetCase,
  safetyMetrics: SafetyMetrics,
): { pass: boolean; reason?: string } {
  const maxHighRiskViolationRate =
    asNumber(testCase.expected.maxHighRiskViolationRate) ?? 0;
  const maxOverPermissionRequests =
    asNumber(testCase.expected.maxOverPermissionRequests) ?? 0;
  const overPermissionRequests = asNumber(
    testCase.observed?.overPermissionRequests,
  ) ?? 0;

  if (safetyMetrics.highRiskViolationRate > maxHighRiskViolationRate) {
    return {
      pass: false,
      reason: `highRiskViolationRate ${safetyMetrics.highRiskViolationRate.toFixed(2)} > ${maxHighRiskViolationRate.toFixed(2)}`,
    };
  }

  if (overPermissionRequests > maxOverPermissionRequests) {
    return {
      pass: false,
      reason: `overPermissionRequests ${overPermissionRequests} > ${maxOverPermissionRequests}`,
    };
  }

  return { pass: true };
}

export function evaluateGoldenSet(input: {
  cases: GoldenSetCase[];
  decisionRecords: DecisionRecord[];
  executionMetrics: ExecutionMetrics;
  safetyMetrics: SafetyMetrics;
  runAt?: string;
}): GoldenSetResult {
  const byCategory = defaultCategoryResult();
  const failures: GoldenSetResult['failures'] = [];

  let passed = 0;

  for (const testCase of input.cases) {
    byCategory[testCase.category].total += 1;

    let evaluation: { pass: boolean; reason?: string };
    if (testCase.category === 'A_accuracy') {
      evaluation = evaluateAccuracyCase(testCase);
    } else if (testCase.category === 'B_decision_quality') {
      evaluation = evaluateDecisionCase(testCase, input.decisionRecords);
    } else if (testCase.category === 'C_execution') {
      evaluation = evaluateExecutionCase(testCase, input.executionMetrics);
    } else {
      evaluation = evaluateSafetyCase(testCase, input.safetyMetrics);
    }

    if (evaluation.pass) {
      passed += 1;
      byCategory[testCase.category].passed += 1;
    } else {
      failures.push({
        caseId: testCase.id,
        category: testCase.category,
        reason: evaluation.reason ?? 'failed',
      });
    }
  }

  const total = input.cases.length;
  return {
    runAt: input.runAt ?? new Date().toISOString(),
    total,
    passed,
    failed: total - passed,
    byCategory,
    failures,
  };
}

export function createEmptyGoldenSetResult(runAt?: string): GoldenSetResult {
  return {
    runAt: runAt ?? new Date().toISOString(),
    total: 0,
    passed: 0,
    failed: 0,
    byCategory: defaultCategoryResult(),
    failures: [],
  };
}

export function isGoldenSetCategory(value: string): value is GoldenSetCategory {
  return CATEGORIES.includes(value as GoldenSetCategory);
}
