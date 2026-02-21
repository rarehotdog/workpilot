# Deployment Trace

## Rule
Production 배포 추적은 아래 3개를 함께 기록합니다.

1. Production URL
2. Inspect URL
3. Commit SHA

## Latest
- Production URL: https://workpilot-lemon.vercel.app
- Vercel URL: https://workpilot-begjrkyla-dydrnsj-5767s-projects.vercel.app
- Inspect URL: https://vercel.com/dydrnsj-5767s-projects/workpilot/8u19jfeF6LGxT1JgtZbPi8xTUkYj
- Commit SHA: `2855f29`
- Timestamp: 2026-02-21
- Health: `GET /api/health` => `{"ok":true,"storageMode":"memory-fallback","dbReachable":false,"openAIConfigured":false,...}`

## Notes
- 이번 단계는 **Vercel Production 환경만** Supabase 키를 연결합니다.
- Preview/Development 환경은 DB 미연결 상태를 기본값으로 유지합니다.

## Rollout Note
- `workpilot/main` 푸시만으로는 자동 반영되지 않아 `npx vercel --prod --yes`로 수동 프로덕션 배포를 실행했습니다.
- 이후 프로덕션 alias(`workpilot-lemon.vercel.app`)가 신규 배포로 갱신된 것을 확인했습니다.
