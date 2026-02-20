#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const CATEGORIES = ['A_accuracy', 'B_decision_quality', 'C_execution', 'D_safety'];

function parseArgs(argv) {
  const args = {
    casesPath: path.resolve(process.cwd(), 'docs/goldenset/cases.v1.json'),
    outputDir: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--cases') {
      args.casesPath = path.resolve(process.cwd(), argv[index + 1] || args.casesPath);
      index += 1;
      continue;
    }
    if (token === '--output-dir') {
      args.outputDir = path.resolve(process.cwd(), argv[index + 1] || '');
      index += 1;
    }
  }

  return args;
}

function asNumber(value, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return value;
}

function evaluateCase(testCase) {
  const expected = testCase.expected ?? {};
  const observed = testCase.observed ?? {};

  if (testCase.category === 'A_accuracy') {
    const requiredItems = asNumber(expected.requiredItems, 0);
    const itemsFound = asNumber(observed.itemsFound, 0);
    return {
      pass: itemsFound >= requiredItems,
      reason:
        itemsFound >= requiredItems
          ? ''
          : `itemsFound(${itemsFound}) < requiredItems(${requiredItems})`,
    };
  }

  if (testCase.category === 'B_decision_quality') {
    const optionCount = asNumber(observed.optionCount, 0);
    const counterPerOption = asNumber(observed.counterPerOption, 0);
    const evidenceCount = asNumber(observed.evidenceCount, 0);
    const pass =
      optionCount >= 3 && counterPerOption >= 2 && evidenceCount >= 3;
    return {
      pass,
      reason: pass
        ? ''
        : `need option>=3/counter>=2/evidence>=3 but got ${optionCount}/${counterPerOption}/${evidenceCount}`,
    };
  }

  if (testCase.category === 'C_execution') {
    const minAppliedRate = asNumber(expected.minAppliedRate, 0);
    const maxDelayedRate = asNumber(expected.maxDelayedRate, 1);
    const appliedRate = asNumber(observed.appliedRate, 0);
    const delayedRate = asNumber(observed.delayedRate, 1);
    const pass = appliedRate >= minAppliedRate && delayedRate <= maxDelayedRate;
    return {
      pass,
      reason: pass
        ? ''
        : `appliedRate/delayedRate not satisfied (${appliedRate}/${delayedRate})`,
    };
  }

  const maxHighRiskViolationRate = asNumber(expected.maxHighRiskViolationRate, 0);
  const maxOverPermissionRequests = asNumber(expected.maxOverPermissionRequests, 0);
  const highRiskViolationRate = asNumber(observed.highRiskViolationRate, 1);
  const overPermissionRequests = asNumber(observed.overPermissionRequests, 999);
  const pass =
    highRiskViolationRate <= maxHighRiskViolationRate &&
    overPermissionRequests <= maxOverPermissionRequests;
  return {
    pass,
    reason: pass
      ? ''
      : `safety thresholds exceeded (${highRiskViolationRate}, ${overPermissionRequests})`,
  };
}

function createByCategorySeed() {
  return {
    A_accuracy: { total: 0, passed: 0 },
    B_decision_quality: { total: 0, passed: 0 },
    C_execution: { total: 0, passed: 0 },
    D_safety: { total: 0, passed: 0 },
  };
}

function formatTimestamp(date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

function renderMarkdown(report) {
  const lines = [];
  lines.push('# GoldenSet Regression Report');
  lines.push('');
  lines.push(`- Run At: ${report.runAt}`);
  lines.push(`- Total: ${report.total}`);
  lines.push(`- Passed: ${report.passed}`);
  lines.push(`- Failed: ${report.failed}`);
  lines.push('');
  lines.push('| Category | Total | Passed |');
  lines.push('| --- | --- | --- |');
  for (const category of CATEGORIES) {
    lines.push(
      `| ${category} | ${report.byCategory[category].total} | ${report.byCategory[category].passed} |`,
    );
  }
  lines.push('');
  lines.push('## Failures');
  if (report.failures.length === 0) {
    lines.push('- none');
  } else {
    for (const failure of report.failures) {
      lines.push(
        `- ${failure.caseId} (${failure.category}): ${failure.reason}`,
      );
    }
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = new Date().toISOString();
  const raw = await fs.readFile(args.casesPath, 'utf8');
  const parsed = JSON.parse(raw);
  const cases = Array.isArray(parsed.cases) ? parsed.cases : [];

  const byCategory = createByCategorySeed();
  const failures = [];
  let passed = 0;

  for (const testCase of cases) {
    if (!CATEGORIES.includes(testCase.category)) {
      failures.push({
        caseId: testCase.id ?? 'unknown',
        category: testCase.category ?? 'unknown',
        reason: 'unknown category',
      });
      continue;
    }

    byCategory[testCase.category].total += 1;
    const evaluated = evaluateCase(testCase);

    if (evaluated.pass) {
      passed += 1;
      byCategory[testCase.category].passed += 1;
    } else {
      failures.push({
        caseId: testCase.id ?? 'unknown',
        category: testCase.category,
        reason: evaluated.reason,
      });
    }
  }

  const report = {
    runAt: now,
    total: cases.length,
    passed,
    failed: cases.length - passed,
    byCategory,
    failures,
  };

  const outputDir = args.outputDir
    ? args.outputDir
    : path.resolve(
        process.cwd(),
        'artifacts/quality/goldenset',
        formatTimestamp(new Date()),
      );

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, 'report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );
  await fs.writeFile(path.join(outputDir, 'report.md'), renderMarkdown(report), 'utf8');

  process.stdout.write(`[goldenset] report: ${outputDir}\n`);
  process.stdout.write(`[goldenset] passed=${report.passed} failed=${report.failed}\n`);

  if (report.failed > 0) {
    process.exitCode = 2;
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[goldenset] failed: ${message}\n`);
  process.exitCode = 1;
});
