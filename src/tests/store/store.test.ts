import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Pilot } from '@/lib/types';
import { resetTestMocks } from '@/tests/test-utils';

const { supabaseStoreMock, memoryStoreMock } = vi.hoisted(() => ({
  supabaseStoreMock: {
    adapterName: 'supabase',
    isConfigured: vi.fn(),
    ping: vi.fn(),
    savePilot: vi.fn(),
    getPilot: vi.fn(),
    updatePilot: vi.fn(),
    getRunLogs: vi.fn(),
    commitRun: vi.fn(),
    deleteRunLogsOlderThan: vi.fn(),
    getMeta: vi.fn(),
    setMeta: vi.fn(),
  },
  memoryStoreMock: {
    adapterName: 'memory',
    isConfigured: vi.fn(),
    ping: vi.fn(),
    savePilot: vi.fn(),
    getPilot: vi.fn(),
    updatePilot: vi.fn(),
    getRunLogs: vi.fn(),
    commitRun: vi.fn(),
    deleteRunLogsOlderThan: vi.fn(),
    getMeta: vi.fn(),
    setMeta: vi.fn(),
  },
}));

vi.mock('@/lib/store-supabase', () => ({
  supabaseStore: supabaseStoreMock,
}));

vi.mock('@/lib/store-memory', () => ({
  memoryStore: memoryStoreMock,
}));

import { resolveStorageModeHint, savePilot } from '@/lib/store';

const basePilot: Pilot = {
  id: 'pilot-1',
  name: '테스트 파일럿',
  oneLiner: '요약',
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
      title: '입력',
      description: '입력 단계',
      tool: 'simulated',
      requiresApproval: false,
    },
    {
      id: 'step_2',
      order: 2,
      type: 'condition',
      title: '승인',
      description: '승인 단계',
      tool: 'simulated',
      requiresApproval: true,
    },
    {
      id: 'step_3',
      order: 3,
      type: 'output',
      title: '출력',
      description: '출력 단계',
      tool: 'openai',
      requiresApproval: false,
      promptTemplate: '요약: {{source_text}}',
    },
  ],
  credits: 50,
  version: 1,
  createdAt: '2026-02-21T00:00:00.000Z',
};

describe('store fallback behavior', () => {
  beforeEach(() => {
    resetTestMocks();

    supabaseStoreMock.isConfigured.mockReturnValue(true);
    supabaseStoreMock.ping.mockResolvedValue(true);
    supabaseStoreMock.savePilot.mockResolvedValue(basePilot);

    memoryStoreMock.isConfigured.mockReturnValue(true);
    memoryStoreMock.savePilot.mockResolvedValue(basePilot);
  });

  it('storageModeHint=memory-fallback이면 memory adapter만 사용한다', async () => {
    const saved = await savePilot(basePilot, {
      requestId: 'rid-memory',
      storageModeHint: 'memory-fallback',
    });

    expect(saved.id).toBe('pilot-1');
    expect(memoryStoreMock.savePilot).toHaveBeenCalledTimes(1);
    expect(supabaseStoreMock.savePilot).not.toHaveBeenCalled();
  });

  it('storageModeHint=supabase이면 supabase adapter만 사용하고 실패 시 fallback하지 않는다', async () => {
    supabaseStoreMock.savePilot.mockRejectedValueOnce(new Error('SUPABASE_DOWN'));

    await expect(
      savePilot(basePilot, {
        requestId: 'rid-supabase',
        storageModeHint: 'supabase',
      }),
    ).rejects.toThrow('SUPABASE_DOWN');

    expect(supabaseStoreMock.savePilot).toHaveBeenCalledTimes(1);
    expect(memoryStoreMock.savePilot).not.toHaveBeenCalled();
  });

  it('storageModeHint가 없으면 supabase 실패 시 memory로 fallback한다', async () => {
    supabaseStoreMock.savePilot.mockRejectedValueOnce(new Error('TEMP_DOWN'));

    const saved = await savePilot(basePilot, {
      requestId: 'rid-fallback',
    });

    expect(saved.id).toBe('pilot-1');
    expect(supabaseStoreMock.savePilot).toHaveBeenCalledTimes(1);
    expect(memoryStoreMock.savePilot).toHaveBeenCalledTimes(1);
  });

  it('resolveStorageModeHint는 설정/핑 상태에 맞는 모드를 반환한다', async () => {
    supabaseStoreMock.isConfigured.mockReturnValueOnce(false);
    await expect(resolveStorageModeHint({ requestId: 'rid-no-config' })).resolves.toBe('memory-fallback');

    supabaseStoreMock.isConfigured.mockReturnValueOnce(true);
    supabaseStoreMock.ping.mockResolvedValueOnce(true);
    await expect(resolveStorageModeHint({ requestId: 'rid-ok' })).resolves.toBe('supabase');

    supabaseStoreMock.isConfigured.mockReturnValueOnce(true);
    supabaseStoreMock.ping.mockResolvedValueOnce(false);
    await expect(resolveStorageModeHint({ requestId: 'rid-unreachable' })).resolves.toBe('memory-fallback');
  });
});
