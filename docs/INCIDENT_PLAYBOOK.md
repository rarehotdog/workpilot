# Incident Playbook

## Severity 기준
- Sev-1: 서비스 핵심 플로우 중단(앱 진입 불가, 퀘스트 저장 전면 실패)
- Sev-2: 핵심 기능 저하(AI 생성 실패율 급증, outbox 장시간 적체)
- Sev-3: 비핵심 기능 결함(UI 일부 오동작)

## 즉시 대응 순서
1. 영향 범위 파악 (세션/사용자군/기능)
2. feature flag rollback (`VITE_FLAG_*_ROLLOUT=0`)
3. 오류 로그 수집 (`app.error`, `sync.*`, `ai.*`)
4. 임시 우회경로 적용 (deterministic fallback 강제)
5. 복구 완료 후 재발방지 액션 등록

## 시나리오별 액션

### A. Supabase 쓰기 실패 급증
- 증상: `sync.outbox_enqueued` 급증, drain 감소
- 조치:
1. Supabase 상태 확인
2. 쓰기 경로 플래그 축소
3. outbox 잔량 관찰
4. 정상화 후 점진 재확장

### B. Gemini 응답 불량/지연
- 증상: `ai.generate_quests_failed` 증가, timeout 증가
- 조치:
1. `ai_guardrails_v2` 유지
2. fallback quest 경로 강제
3. timeout 값 점검
4. 모델/프롬프트 점검 후 재배포

### C. 프런트 크래시 증가
- 증상: `app.error` 급증, 화면 진입 실패
- 조치:
1. 직전 배포 rollback
2. ErrorBoundary 로그 확인
3. 재현 경로 최소화 후 hotfix

## 커뮤니케이션 템플릿
- 탐지 시각
- 영향 범위
- 임시 조치
- ETA
- 최종 원인/재발방지
