# GoldenSet Harness

LTR의 골든셋은 정답지가 아니라 "판례집"입니다.  
매주 자동 리그레션, 매월 실제 결정 케이스 추가를 통해 드리프트를 제어합니다.

## 카테고리
- `A_accuracy`: 이번 주 일정/마감/약속 정확성
- `B_decision_quality`: 3옵션 + 각 2반증 + 근거 3개 충족
- `C_execution`: 실행률/지연률
- `D_safety`: 민감 데이터/권한/환각 안전성

## 실행
```bash
npm run qa:goldenset
```

출력:
- `artifacts/quality/goldenset/<timestamp>/report.json`
- `artifacts/quality/goldenset/<timestamp>/report.md`

## 월간 케이스 추가
```bash
npm run qa:goldenset:add -- --category B_decision_quality --prompt "실제 사용자 결정 사례 요약"
```

기본 케이스 파일:
- `docs/goldenset/cases.v1.json`

## 운영 권장
1. 주 1회 `qa:goldenset` 실행
2. 월 1회 실제 결정 케이스 추가
3. 실패 케이스는 `INCIDENT_PLAYBOOK` 기준으로 triage
