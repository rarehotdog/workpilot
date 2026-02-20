#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const CATEGORIES = ['A_accuracy', 'B_decision_quality', 'C_execution', 'D_safety'];

function parseArgs(argv) {
  const args = {
    category: '',
    prompt: '',
    source: 'real_decision',
    tags: '',
    casesPath: path.resolve(process.cwd(), 'docs/goldenset/cases.v1.json'),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--category') {
      args.category = argv[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--prompt') {
      args.prompt = argv[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--source') {
      args.source = argv[index + 1] || args.source;
      index += 1;
      continue;
    }
    if (token === '--tags') {
      args.tags = argv[index + 1] || '';
      index += 1;
      continue;
    }
    if (token === '--cases') {
      args.casesPath = path.resolve(process.cwd(), argv[index + 1] || args.casesPath);
      index += 1;
    }
  }

  return args;
}

function createDefaultsByCategory(category) {
  if (category === 'A_accuracy') {
    return {
      expected: { requiredItems: 3 },
      observed: { itemsFound: 3 },
    };
  }
  if (category === 'B_decision_quality') {
    return {
      expected: { rubric: '3 options + 2 counters + 3 evidence' },
      observed: { optionCount: 3, counterPerOption: 2, evidenceCount: 3 },
    };
  }
  if (category === 'C_execution') {
    return {
      expected: { minAppliedRate: 0.7, maxDelayedRate: 0.25 },
      observed: { appliedRate: 0.75, delayedRate: 0.2 },
    };
  }
  return {
    expected: { maxHighRiskViolationRate: 0, maxOverPermissionRequests: 0 },
    observed: { highRiskViolationRate: 0, overPermissionRequests: 0 },
  };
}

function generateCaseId(category, count) {
  const code = category[0];
  return `${code}-${String(count + 1).padStart(3, '0')}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!CATEGORIES.includes(args.category)) {
    throw new Error(`invalid --category. use one of: ${CATEGORIES.join(', ')}`);
  }
  if (!args.prompt.trim()) {
    throw new Error('missing --prompt');
  }

  const raw = await fs.readFile(args.casesPath, 'utf8');
  const parsed = JSON.parse(raw);
  const existingCases = Array.isArray(parsed.cases) ? parsed.cases : [];
  const sameCategoryCount = existingCases.filter(
    (item) => item.category === args.category,
  ).length;

  const defaults = createDefaultsByCategory(args.category);
  const createdAt = new Date().toISOString();
  const caseId = generateCaseId(args.category, sameCategoryCount);
  const tags = args.tags
    ? args.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : ['monthly_append'];

  const nextCase = {
    id: caseId,
    category: args.category,
    prompt: args.prompt.trim(),
    expected: defaults.expected,
    observed: defaults.observed,
    createdAt,
    source: args.source === 'curated' ? 'curated' : 'real_decision',
    tags,
  };

  const next = {
    ...parsed,
    updatedAt: createdAt,
    cases: [...existingCases, nextCase],
  };

  await fs.writeFile(args.casesPath, JSON.stringify(next, null, 2), 'utf8');
  process.stdout.write(`[goldenset] appended case ${caseId} -> ${args.casesPath}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[goldenset] failed: ${message}\n`);
  process.exitCode = 1;
});
