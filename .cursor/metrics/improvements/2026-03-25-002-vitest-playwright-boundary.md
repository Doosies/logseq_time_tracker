# 시스템 개선 메모 — 2026-03-25-002

## 맥락

사이클 메트릭에 기록된 QA 재시도 원인: Vitest가 Playwright 스펙을 수집함.

## 관찰

- `vite.config.ts`의 `test.exclude`로 E2E 경로를 제외하는 패턴이 효과적이었음.
- 동일 패턴을 다른 패키지에 복제할 때 `e2e/**/*.spec.ts` 및 산출물 `e2e/dist`를 명시적으로 제외하는지 점검할 것.

## 권장 (코드 변경 없음)

1. 새 패키지에 Playwright를 도입할 때 QA 체크리스트에 “Vitest 수집 대상에서 e2e 제외 확인” 항목 유지.
2. 선택: `packages/logseq-time-tracker/e2e/.gitignore`에 `dist/` 추가 시 실수로 `git add e2e/` 해도 산출물이 스테이징되지 않음(현재는 파일 단위 add로 회피).

## 측정

- 본 사이클: QA `retries: 1`, 에러 1건(수정 후 통과).
