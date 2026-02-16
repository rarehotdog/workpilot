# SLO (Service Level Objectives)

## 목표
- Crash-free sessions: **99.9% 이상**
- 핵심 액션(quest save/complete) 성공률: **99.95% 이상**
- AI 실패 시 fallback quest 제공률: **100%**
- 모바일 p95 초기 렌더: **2.5s 이하**
- 인터랙션 지연 p95: **100ms 이하**
- Incident MTTR: **30분 이내**

## SLI 정의
- `app.error` 이벤트 / 총 세션 수
- `sync.outbox_enqueued`, `sync.outbox_drain` 추이
- `ai.generate_quests_failed` 대비 fallback 적용률
- Web Vitals(FCP/LCP/INP) p95

## 에러 버짓
- 월 단위 가용성 기준 99.9% 유지
- 버짓 초과 시 기능 확장 중단, 안정화 작업 우선

## 측정 주기
- 일간: 에러/동기화 지표
- 주간: 성능 p95, 실패 패턴
- 월간: 버짓 소진율, MTTR 회고
