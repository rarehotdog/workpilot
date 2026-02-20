# Deployment Guide

LTR는 Vite SPA이며 빌드 산출물은 `dist/`입니다.

## 1) 사전 검증
```bash
npm install
npm run lint
npm run build
npx tsc --noEmit
```

## 2) 공통 배포 설정
- Build Command: `npm run build`
- Output Directory: `dist`
- Node: 18+
- SPA Redirect: `/* -> /index.html`

## 3) Vercel
1. 저장소 연결
2. Framework: `Vite`
3. Build / Output 설정 적용
4. 환경 변수 등록 후 배포

## 4) Netlify
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 5) GitHub Pages
1. `gh-pages` 설치
```bash
npm i -D gh-pages
```
2. `package.json` script 추가
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```
3. `npm run deploy`

## 6) 운영 권장 설정
- 점진 롤아웃: feature flags (`VITE_FLAG_*_ROLLOUT`)
- 에러 버짓 초과 시 롤백: flags를 즉시 0으로 전환
- outbox flush 모니터링: sync enqueue/drain 이벤트 확인

## 7) 필수 환경 변수
- `VITE_GEMINI_API_KEY`
- `VITE_OPENAI_API_KEY`
- `VITE_OPENAI_MODEL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 8) 선택 환경 변수
- `VITE_AI_TIMEOUT_MS`
- `VITE_GEMINI_TIMEOUT_MS`
- `VITE_FLAG_RELIABLE_STORAGE_V2_ROLLOUT`
- `VITE_FLAG_AI_GUARDRAILS_V2_ROLLOUT`
- `VITE_FLAG_TELEMETRY_V1_ROLLOUT`
- `VITE_FLAG_DECISION_TERMINAL_V1_ROLLOUT`
- `VITE_FLAG_DECISION_LOG_UI_V1_ROLLOUT`
- `VITE_FLAG_SYNC_STATUS_UI_V1_ROLLOUT`
- `VITE_FLAG_GOVERNANCE_AUDIT_V1_ROLLOUT`
- `VITE_FLAG_GOLDENSET_V1_ROLLOUT`

## 9) 운영 문서
- [SLO](./SLO.md)
- [Operations Runbook](./OPERATIONS_RUNBOOK.md)
- [Incident Playbook](./INCIDENT_PLAYBOOK.md)
- [GoldenSet Harness](./GOLDENSET_HARNESS.md)
- [Privacy & Governance Checklist](./PRIVACY_GOVERNANCE_CHECKLIST.md)
