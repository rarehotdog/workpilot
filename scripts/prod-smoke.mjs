#!/usr/bin/env node

const baseUrl = process.env.WORKPILOT_BASE_URL || 'https://workpilot-lemon.vercel.app';

function assert(condition, message, context) {
  if (condition) {
    return;
  }

  const detail = context ? `\ncontext=${JSON.stringify(context, null, 2)}` : '';
  throw new Error(`${message}${detail}`);
}

async function parseJsonSafe(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { rawText: text };
  }
}

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const body = await parseJsonSafe(response);
  return { response, body };
}

function summarizeCreate(body) {
  return {
    pilotId: body?.pilot?.id,
    inputs: body?.pilot?.inputs?.length,
    steps: body?.pilot?.steps?.length,
    compileMode: body?.compileMode,
  };
}

async function run() {
  console.log(`[smoke] baseUrl=${baseUrl}`);

  const health = await requestJson('/api/health', {
    method: 'GET',
    headers: {
      'x-request-id': 'smoke-health',
    },
  });

  assert(health.response.status === 200, 'health status must be 200', {
    status: health.response.status,
    body: health.body,
  });
  assert(health.body?.ok === true, 'health.ok must be true', health.body);
  console.log('[smoke] health ok');

  const formData = new FormData();
  formData.set('name', `Smoke ${new Date().toISOString()}`);
  formData.set('recordMode', 'describe');
  formData.set('taskDescription', '스모크 테스트: 생성/실행/로그 검증');

  const create = await requestJson('/api/pilots', {
    method: 'POST',
    body: formData,
    headers: {
      'x-request-id': 'smoke-create',
    },
  });

  assert(create.response.status === 200, 'create status must be 200', {
    status: create.response.status,
    body: create.body,
  });

  const pilotId = create.body?.pilot?.id;
  assert(typeof pilotId === 'string' && pilotId.length > 0, 'pilot id must exist', create.body);
  console.log('[smoke] create ok', summarizeCreate(create.body));

  const runMissing = await requestJson('/api/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'smoke-run-missing',
    },
    body: JSON.stringify({
      pilotId,
      values: {},
    }),
  });

  assert(runMissing.response.status === 400, 'run-missing status must be 400', {
    status: runMissing.response.status,
    body: runMissing.body,
  });
  assert(Array.isArray(runMissing.body?.missingRequiredKeys), 'missingRequiredKeys must be array', runMissing.body);
  console.log('[smoke] run missing ok', {
    missingRequiredKeys: runMissing.body?.missingRequiredKeys,
    missingRequiredLabels: runMissing.body?.missingRequiredLabels,
  });

  const runSuccess = await requestJson('/api/run', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': 'smoke-run-success',
    },
    body: JSON.stringify({
      pilotId,
      values: {
        source_text: '스모크 테스트 입력 텍스트',
      },
    }),
  });

  assert(runSuccess.response.status === 200, 'run-success status must be 200', {
    status: runSuccess.response.status,
    body: runSuccess.body,
  });
  assert(typeof runSuccess.body?.creditsLeft === 'number', 'creditsLeft must be number', runSuccess.body);
  console.log('[smoke] run success ok', {
    creditsLeft: runSuccess.body?.creditsLeft,
    runLogStatus: runSuccess.body?.runLog?.status,
    mode: runSuccess.body?.mode,
  });

  const detail = await requestJson(`/api/pilots/${pilotId}`, {
    method: 'GET',
    headers: {
      'x-request-id': 'smoke-detail',
    },
  });

  assert(detail.response.status === 200, 'detail status must be 200', {
    status: detail.response.status,
    body: detail.body,
  });
  assert(Array.isArray(detail.body?.runLogsLast3), 'runLogsLast3 must be array', detail.body);
  assert((detail.body?.runLogsLast3?.length || 0) >= 1, 'runLogsLast3 must include at least one log', detail.body);

  console.log('[smoke] detail ok', {
    credits: detail.body?.pilot?.credits,
    runLogsLast3: detail.body?.runLogsLast3?.length,
  });

  console.log('[smoke] all checks passed');
}

run().catch((error) => {
  console.error('[smoke] failed');
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
