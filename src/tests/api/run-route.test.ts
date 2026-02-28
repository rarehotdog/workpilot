import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonOf, makeJsonRequest, resetTestMocks } from '@/tests/test-utils';
import type { Pilot, RunLog } from '@/lib/types';

const {
  resolveStorageModeHintMock,
  getPilotMock,
  commitRunMock,
  cleanupRunLogsOlderThan90DaysMock,
  runWorkflowMock,
} = vi.hoisted(() => ({
  resolveStorageModeHintMock: vi.fn(),
  getPilotMock: vi.fn(),
  commitRunMock: vi.fn(),
  cleanupRunLogsOlderThan90DaysMock: vi.fn(),
  runWorkflowMock: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
  resolveStorageModeHint: resolveStorageModeHintMock,
  getPilot: getPilotMock,
  commitRun: commitRunMock,
}));

vi.mock('@/lib/retention', () => ({
  cleanupRunLogsOlderThan90Days: cleanupRunLogsOlderThan90DaysMock,
}));

vi.mock('@/lib/run', () => ({
  runWorkflow: runWorkflowMock,
}));

import { POST } from '@/app/api/run/route';

const basePilot: Pilot = {
  id: 'pilot-1',
  name: '테스트 워크플로우',
  oneLiner: '테스트 one-liner',
  recordMode: 'describe',
  record: {},
  inputs: [
    {
      key: 'company_name',
      label: '고객사 이름',
      required: true,
    },
    {
      key: 'notes',
      label: '메모',
      required: false,
    },
  ],
  steps: [
    {
      id: 'step_1',
      order: 1,
      type: 'trigger',
      title: '입력 수집',
      description: '입력을 수집합니다.',
      tool: 'simulated',
      requiresApproval: false,
    },
    {
      id: 'step_2',
      order: 2,
      type: 'condition',
      title: '승인',
      description: '승인을 기다립니다.',
      tool: 'simulated',
      requiresApproval: true,
    },
    {
      id: 'step_3',
      order: 3,
      type: 'output',
      title: '출력 생성',
      description: '결과를 생성합니다.',
      tool: 'openai',
      requiresApproval: false,
      promptTemplate: '회사명: {{company_name}}',
    },
  ],
  credits: 50,
  version: 1,
  createdAt: '2026-02-21T00:00:00.000Z',
};

describe('POST /api/run', () => {
  beforeEach(() => {
    resetTestMocks();

    resolveStorageModeHintMock.mockResolvedValue('memory-fallback');
    cleanupRunLogsOlderThan90DaysMock.mockResolvedValue({
      attempted: false,
      skipped: true,
      deletedCount: 0,
    });
    getPilotMock.mockResolvedValue(basePilot);
    runWorkflowMock.mockResolvedValue({
      output: '# 실행 결과\n\n정상 처리',
      mode: 'fallback',
      totalTokens: undefined,
    });
    commitRunMock.mockResolvedValue({
      status: 'success',
      creditsLeft: 49,
    });
  });

  it('required 누락 시 400과 누락 필드 목록을 반환하고 credits를 차감하지 않는다', async () => {
    const request = makeJsonRequest(
      '/api/run',
      {
        pilotId: 'pilot-1',
        values: {
          notes: '테스트 메모',
        },
      },
      { requestId: 'rid-run-required' },
    );

    const response = await POST(request);
    const data = await jsonOf<{
      error: string;
      missingRequiredKeys: string[];
      missingRequiredLabels: string[];
    }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain('누락');
    expect(data.missingRequiredKeys).toEqual(['company_name']);
    expect(data.missingRequiredLabels).toEqual(['고객사 이름']);
    expect(runWorkflowMock).not.toHaveBeenCalled();
    expect(commitRunMock).not.toHaveBeenCalled();

    const expectedContext = expect.objectContaining({
      requestId: 'rid-run-required',
      storageModeHint: 'memory-fallback',
    });

    expect(cleanupRunLogsOlderThan90DaysMock).toHaveBeenCalledWith(expectedContext);
    expect(getPilotMock).toHaveBeenCalledWith('pilot-1', expectedContext);
  });

  it('credits가 0이면 402를 반환한다', async () => {
    getPilotMock.mockResolvedValueOnce({
      ...basePilot,
      credits: 0,
    });

    const request = makeJsonRequest(
      '/api/run',
      {
        pilotId: 'pilot-1',
        values: {
          company_name: 'ACME',
        },
      },
      { requestId: 'rid-run-credits' },
    );

    const response = await POST(request);
    const data = await jsonOf<{ error: string }>(response);

    expect(response.status).toBe(402);
    expect(data.error).toContain('크레딧');
    expect(runWorkflowMock).not.toHaveBeenCalled();
    expect(commitRunMock).not.toHaveBeenCalled();
  });

  it('정상 입력 시 200, credits 감소, runLog 저장을 반환한다', async () => {
    const request = makeJsonRequest(
      '/api/run',
      {
        pilotId: 'pilot-1',
        values: {
          company_name: 'ACME',
          notes: '요약 생성',
        },
      },
      { requestId: 'rid-run-success' },
    );

    const response = await POST(request);
    const data = await jsonOf<{
      output: string;
      creditsLeft: number;
      runLog: RunLog;
      mode: string;
    }>(response);

    expect(response.status).toBe(200);
    expect(data.output).toContain('실행 결과');
    expect(data.creditsLeft).toBe(49);
    expect(data.runLog.pilotId).toBe('pilot-1');
    expect(data.runLog.status).toBe('success');
    expect(data.mode).toBe('fallback');

    const expectedContext = expect.objectContaining({
      requestId: 'rid-run-success',
      storageModeHint: 'memory-fallback',
    });

    expect(commitRunMock).toHaveBeenCalledTimes(1);
    expect(commitRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pilotId: 'pilot-1',
        log: expect.objectContaining({
          pilotId: 'pilot-1',
          status: 'success',
          inputValues: {
            company_name: 'ACME',
            notes: '요약 생성',
          },
        }),
      }),
      expectedContext,
    );
  });
});
