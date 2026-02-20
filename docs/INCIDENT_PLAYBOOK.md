# Incident Playbook

## Severity 기준
- Sev-1: 서비스 핵심 플로우 중단(앱 진입 불가, 퀘스트 저장 전면 실패)
- Sev-2: 핵심 기능 저하(AI 생성 실패율 급증, outbox 장시간 적체)
- Sev-3: 비핵심 기능 결함(UI 일부 오동작, 단기 품질 저하)

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

### D. Decision quality regression
- 증상: `decision.quality_scored` 평균 급락, 골든셋 fail 증가
- 조치:
1. 최근 24시간 decision log의 3/2/3 규칙 충족률 확인
2. execution delayed/skipped 비율 확인
3. 결정 생성 소스(AI/fallback)별 품질 편차 확인
4. 필요 시 `decision_terminal_v1` rollout 축소

### E. Governance breach risk
- 증상: `governance.risk_flagged` 급증, high-risk denied 비정상 패턴
- 조치:
1. scope별 위험도 분포 확인 (`health/email/finance`)
2. 승인 흐름 누락 여부 확인
3. `governance_audit_v1` 플래그 조정 및 hotfix

### F. Permission mis-scope
- 증상: 저위험 액션이 고위험으로 잘못 분류되거나 반대 케이스 발생
- 조치:
1. `evaluateRisk(scope)` 매핑 검토
2. 감사로그 샘플링으로 분류 정확도 점검
3. 분류 테이블 수정 후 골든셋 D 카테고리 재실행

## 커뮤니케이션 템플릿
- 탐지 시각
- 영향 범위
- 임시 조치
- ETA
- 최종 원인/재발방지
