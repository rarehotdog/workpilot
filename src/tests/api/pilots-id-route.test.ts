import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonOf, makeJsonRequest, resetTestMocks } from '@/tests/test-utils';
import type { Pilot, RunLog } from '@/lib/types';

const { getPilotMock, getRunLogsMock, updatePilotMock, resolveStorageModeHintMock } = vi.hoisted(() => ({
  getPilotMock: vi.fn(),
  getRunLogsMock: vi.fn(),
  updatePilotMock: vi.fn(),
  resolveStorageModeHintMock: vi.fn(),
}));

vi.mock('@/lib/store', () => ({
  getPilot: getPilotMock,
  getRunLogs: getRunLogsMock,
  updatePilot: updatePilotMock,
  resolveStorageModeHint: resolveStorageModeHintMock,
}));

import { GET, PATCH } from '@/app/api/pilots/[id]/route';

const basePilot: Pilot = {
  id: 'pilot-1',
  name: '기본 워크플로우',
  oneLiner: '기본 설명',
  recordMode: 'describe',
  record: {},
  inputs: [
    {
      key: 'source_text',
      label: '원본 텍스트',
      required: true,
    },
  ],
  steps: [
    {
      id: 'step_1',
      order: 1,
      type: 'trigger',
      title: '입력 수집',
      description: '입력 수집',
      tool: 'simulated',
      requiresApproval: false,
    },
    {
      id: 'step_2',
      order: 2,
      type: 'condition',
      title: '승인',
      description: '승인',
      tool: 'simulated',
      requiresApproval: true,
    },
    {
      id: 'step_3',
      order: 3,
      type: 'output',
      title: '출력',
      description: '출력',
      tool: 'openai',
      requiresApproval: false,
      promptTemplate: '요약: {{source_text}}',
    },
  ],
  credits: 50,
  version: 1,
  createdAt: '2026-02-21T00:00:00.000Z',
};

const baseRunLog: RunLog = {
  id: 'log-1',
  pilotId: 'pilot-1',
  createdAt: '2026-02-21T01:00:00.000Z',
  inputValues: {
    source_text: 'sample',
  },
  outputPreview: 'preview',
  status: 'success',
};

describe('/api/pilots/[id] routes', () => {
  beforeEach(() => {
    resetTestMocks();

    resolveStorageModeHintMock.mockResolvedValue('memory-fallback');
    getPilotMock.mockResolvedValue(basePilot);
    getRunLogsMock.mockResolvedValue([baseRunLog]);
    updatePilotMock.mockImplementation(async (_id: string, updater: (pilot: Pilot) => Pilot) => updater(basePilot));
  });

  it('GET은 pilot + runLogsLast3를 반환하고 동일 request context를 사용한다', async () => {
    const request = new Request('http://localhost:3000/api/pilots/pilot-1', {
      method: 'GET',
      headers: {
        'x-request-id': 'rid-pilot-get',
      },
    });

    const response = await GET(request, { params: { id: 'pilot-1' } });
    const data = await jsonOf<{ pilot: Pilot; runLogsLast3: RunLog[] }>(response);

    expect(response.status).toBe(200);
    expect(data.pilot.id).toBe('pilot-1');
    expect(data.runLogsLast3).toHaveLength(1);
    expect(data.runLogsLast3[0].id).toBe('log-1');

    const expectedContext = expect.objectContaining({
      requestId: 'rid-pilot-get',
      storageModeHint: 'memory-fallback',
    });

    expect(resolveStorageModeHintMock).toHaveBeenCalledWith({ requestId: 'rid-pilot-get' });
    expect(getPilotMock).toHaveBeenCalledWith('pilot-1', expectedContext);
    expect(getRunLogsMock).toHaveBeenCalledWith('pilot-1', 3, expectedContext);
  });

  it('PATCH는 version을 증가시키고 수정값을 반영한다', async () => {
    const request = makeJsonRequest(
      '/api/pilots/pilot-1',
      {
        oneLiner: '수정된 설명',
      },
      {
        method: 'PATCH',
        requestId: 'rid-pilot-patch',
      },
    );

    const response = await PATCH(request, { params: { id: 'pilot-1' } });
    const data = await jsonOf<{ pilot: Pilot }>(response);

    expect(response.status).toBe(200);
    expect(data.pilot.oneLiner).toBe('수정된 설명');
    expect(data.pilot.version).toBe(2);

    const expectedContext = expect.objectContaining({
      requestId: 'rid-pilot-patch',
      storageModeHint: 'memory-fallback',
    });

    expect(updatePilotMock).toHaveBeenCalledTimes(1);
    expect(updatePilotMock.mock.calls[0]?.[0]).toBe('pilot-1');
    expect(updatePilotMock.mock.calls[0]?.[2]).toEqual(expectedContext);
  });
});
