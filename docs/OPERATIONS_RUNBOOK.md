# Operations Runbook

## 1) 배포 전 체크
1. `npm run lint`
2. `npm run build`
3. `npx tsc --noEmit`
4. 핵심 플로우 수동 검증

## 2) 점진 롤아웃 절차
1. `VITE_FLAG_*_ROLLOUT=10` 배포
2. 30분 모니터링 (error/outbox/AI 실패율)
3. 이상 없으면 50 -> 100 순차 상승
4. 이상 시 즉시 0으로 rollback

## 3) 런타임 점검 포인트
- `sync.outbox_enqueued` 급증 여부
- `sync.outbox_drain` 처리량/잔량
- `ai.generate_quests_failed` 비율
- `app.error` 증가 추이

## 4) Outbox 운영
- 네트워크 불안정 시 enqueue 증가 가능
- 온라인 복귀 후 자동 drain 확인
- outbox 잔량이 지속 증가하면 Supabase 쓰기 경로 점검

## 5) 데이터 호환성
- schema migration은 앱 부트스트랩 시 자동 실행
- `ltr_year_image` 레거시 키는 scoped key로 이관
- 데이터 리셋 없이 무손실 호환 유지
