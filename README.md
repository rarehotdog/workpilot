# LIFE TREADMILLS (LTR)

AI가 삶의 맥락을 읽고, 오늘 실행할 단 하나의 다음 행동을 설계하는 Life OS.

## Core Idea
- 문제: 의지 부족이 아니라 결정 피로(decision fatigue)
- 해법: Context -> Think -> Action 루프에서 의사결정 비용 제거
- 원칙: 실패는 리셋이 아니라 경로 수정 데이터

## 3-Layer Architecture
1. Context Layer
- 텍스트, 음성, 이미지, 행동 로그 기반 상태 수집
- 제약(시간/에너지/환경) + 패턴(실패/성공) 관리

2. Think Layer
- Gemini 추론으로 오늘의 우선 경로 계산
- Dynamic Tech-Tree 업데이트

3. Action Layer
- 위젯형 Today Dashboard
- 메인 퀘스트 + 대체 퀘스트 + 실패 복구 루프

## Current App Status
- 온보딩/프로필 저장
- 오늘의 퀘스트 생성/완료/실패 처리
- 실패 복구 플로우
- 테크트리 화면
- XP/레벨/스트릭 게이미피케이션
- Home의 `Pathfinder OS` 3-Layer 위젯 섹션

## Project Structure
```text
/Users/taehyeonkim/Documents/New project
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── OnboardingFlow.tsx
│   │   ├── character/
│   │   ├── gamification/
│   │   └── mobile/
│   ├── lib/
│   └── styles/
├── docs/
│   ├── HACKATHON_ONE_PAGER.md
│   ├── GEMINI_PROMPTS.md
│   └── DEMO_SCRIPT_3MIN.md
└── vite.config.ts
```

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

참고: 현재 환경에서는 PWA 서비스워커 단계에서 빌드 이슈가 발생할 수 있습니다(`vite-plugin-pwa`).

## Hackathon Docs
- One Pager: `/Users/taehyeonkim/Documents/New project/docs/HACKATHON_ONE_PAGER.md`
- Prompt Pack: `/Users/taehyeonkim/Documents/New project/docs/GEMINI_PROMPTS.md`
- 3-min Demo Script: `/Users/taehyeonkim/Documents/New project/docs/DEMO_SCRIPT_3MIN.md`
