# Privacy & Governance Checklist

본 문서는 법률 자문 문서가 아니라, LTR 운영 체크리스트입니다.

## 1) 데이터 최소수집
- [ ] 의사결정 품질 개선에 필요한 최소 필드만 수집
- [ ] raw 음성/민감 텍스트는 텔레메트리에 직접 전송하지 않음
- [ ] 민감 데이터는 기본 opt-in 비활성

## 2) 권한/승인
- [ ] `health/email/finance` 범위는 명시적 승인 필요
- [ ] 승인/거절 모두 감사로그에 기록
- [ ] 고위험 scope 무승인 실행 0건 유지

## 3) 감사 로그
- [ ] `governance_audit_log` 보존 정책 적용
- [ ] 리스크 레벨(`low/medium/high`) 분류 일관성 점검
- [ ] 월간 감사 리포트 생성

## 4) 보존/삭제
- [ ] 로컬 저장 키 목록 문서화
- [ ] 사용자 요청 시 삭제 가능한 경로 제공
- [ ] 스키마 마이그레이션 시 무손실 호환 확인

## 5) 운영 경보
- [ ] `governance.risk_flagged` 급증 시 즉시 triage
- [ ] DQI 급락 + 고위험 위반 동시 발생 시 Sev-2 처리

## 6) 릴리즈 게이트
- [ ] `npm run lint`, `npm run build`, `npx tsc --noEmit` 통과
- [ ] `npm run qa:goldenset` 실패 0
- [ ] 스크린샷 QA 기준(375/390/430) 통과
