import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonOf, makeFileOfSize, makeFormRequest, resetTestMocks } from '@/tests/test-utils';
import type { Pilot } from '@/lib/types';

const { compileWorkflowMock, savePilotMock, resolveStorageModeHintMock } = vi.hoisted(() => ({
  compileWorkflowMock: vi.fn(),
  savePilotMock: vi.fn(),
  resolveStorageModeHintMock: vi.fn(),
}));

vi.mock('@/lib/compile', () => ({
  buildDefaultName: (name?: string) => name ?? '새 워크플로우',
  compileWorkflow: compileWorkflowMock,
}));

vi.mock('@/lib/store', () => ({
  savePilot: savePilotMock,
  resolveStorageModeHint: resolveStorageModeHintMock,
}));

import { POST } from '@/app/api/pilots/route';

const compileSpec = {
  oneLiner: '입력을 요약해 공유용으로 정리합니다.',
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
      type: 'trigger' as const,
      title: '입력 수집',
      description: '입력을 수집합니다.',
      tool: 'simulated' as const,
      requiresApproval: false,
    },
    {
      id: 'step_2',
      order: 2,
      type: 'condition' as const,
      title: '승인',
      description: '승인을 기다립니다.',
      tool: 'simulated' as const,
      requiresApproval: true,
    },
    {
      id: 'step_3',
      order: 3,
      type: 'output' as const,
      title: '결과 생성',
      description: '최종 결과를 생성합니다.',
      tool: 'openai' as const,
      requiresApproval: false,
      promptTemplate: '다음을 요약하세요: {{source_text}}',
    },
  ],
};

describe('POST /api/pilots', () => {
  beforeEach(() => {
    resetTestMocks();
    resolveStorageModeHintMock.mockResolvedValue('memory-fallback');
    compileWorkflowMock.mockResolvedValue({
      spec: compileSpec,
      mode: 'fallback',
    });
    savePilotMock.mockImplementation(async (pilot: Pilot) => pilot);
  });

  it('이미지 MIME mismatch면 400을 반환한다', async () => {
    const formData = new FormData();
    formData.set('name', 'MIME 테스트');
    formData.set('recordMode', 'capture');
    formData.set('captureFile', new File(['hello'], 'bad.txt', { type: 'text/plain' }));

    const request = makeFormRequest('/api/pilots', formData, { requestId: 'rid-pilot-mime' });
    const response = await POST(request);
    const data = await jsonOf<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain('이미지 파일만');
    expect(compileWorkflowMock).not.toHaveBeenCalled();
    expect(savePilotMock).not.toHaveBeenCalled();
  });

  it('이미지 크기가 5MB를 초과하면 400을 반환한다', async () => {
    const formData = new FormData();
    formData.set('name', '사이즈 테스트');
    formData.set('recordMode', 'capture');
    formData.set('captureFile', makeFileOfSize(5 * 1024 * 1024 + 1, 'big.png', 'image/png'));

    const request = makeFormRequest('/api/pilots', formData, { requestId: 'rid-pilot-size' });
    const response = await POST(request);
    const data = await jsonOf<{ error: string }>(response);

    expect(response.status).toBe(400);
    expect(data.error).toContain('5MB');
    expect(compileWorkflowMock).not.toHaveBeenCalled();
    expect(savePilotMock).not.toHaveBeenCalled();
  });

  it('정상 생성 시 pilot/url을 반환하고 동일 request context로 저장한다', async () => {
    const formData = new FormData();
    formData.set('name', '정상 생성');
    formData.set('recordMode', 'describe');
    formData.set('taskDescription', '매주 요약 리포트를 작성한다');

    const request = makeFormRequest('/api/pilots', formData, { requestId: 'rid-pilot-create' });
    const response = await POST(request);
    const data = await jsonOf<{ pilot: Pilot; url: string; compileMode: string }>(response);

    expect(response.status).toBe(200);
    expect(data.url).toContain('/pilot/');
    expect(data.compileMode).toBe('fallback');
    expect(data.pilot.name).toBe('정상 생성');
    expect(data.pilot.inputs.length).toBeGreaterThan(0);

    const expectedContext = expect.objectContaining({
      requestId: 'rid-pilot-create',
      storageModeHint: 'memory-fallback',
    });

    expect(resolveStorageModeHintMock).toHaveBeenCalledWith({ requestId: 'rid-pilot-create' });
    expect(savePilotMock).toHaveBeenCalledWith(expect.objectContaining({ name: '정상 생성' }), expectedContext);
  });
});
