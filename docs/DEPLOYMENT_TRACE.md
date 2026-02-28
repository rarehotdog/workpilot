# Deployment Trace

## Rule
Production 배포 추적은 아래 3개를 함께 기록합니다.

1. Production URL
2. Inspect URL
3. Commit SHA

## CI Gate
- 상태: enabled
- 워크플로우:
  - `.github/workflows/ci.yml` (`pull_request(main)`, `push(main)`)
  - `.github/workflows/prod-smoke.yml` (`workflow_dispatch`)
- 공통 규칙:
  - `ci.yml`는 `npm run verify:ci` 통과를 필수 게이트로 사용
  - `prod-smoke.yml` 실행 결과(성공/실패, 실패 시 원인)는 Latest 또는 별도 항목에 기록

## Latest
- Production URL: https://workpilot-lemon.vercel.app
- Vercel URL: https://workpilot-1mn4wfyvb-dydrnsj-5767s-projects.vercel.app
- Inspect URL: https://vercel.com/dydrnsj-5767s-projects/workpilot/AMskWC6he3TECzYn4HncKzGWMk9j
- Commit SHA: `5ef599b`
- Timestamp: 2026-02-21
- Health: `GET /api/health` => `{"ok":true,"version":"0.1.0","storageMode":"supabase","dbReachable":true,"openAIConfigured":false}`
- API Smoke: `POST /api/pilots` 200, `/api/run` required 누락 400, `/api/run` 성공 200, `GET /api/pilots/[id]` 로그/credits 확인 완료
- Script Smoke: `node scripts/prod-smoke.mjs` (WORKPILOT_BASE_URL=`https://workpilot-lemon.vercel.app`) 통과

## Notes
- 이번 단계는 **Vercel Production 환경만** Supabase 키를 연결합니다.
- Preview/Development 환경은 DB 미연결 상태를 기본값으로 유지합니다.

## Rollout Note
- `workpilot/main` 푸시만으로는 자동 반영되지 않아 `npx vercel --prod --yes`로 수동 프로덕션 배포를 실행했습니다.
- 이후 프로덕션 alias(`workpilot-lemon.vercel.app`)가 신규 배포로 갱신된 것을 확인했습니다.
