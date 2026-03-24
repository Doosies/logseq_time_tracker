# Phase 2 검증 강화 + Import Zod 스키마 검증

## 개요

Phase 2 SQLite 영속화를 실제 검증 가능하게 만들고, import 런타임 스키마 검증(Zod)을 추가했습니다.

## 변경 사항

### 신규 파일
- `packages/time-tracker-core/src/types/export_schema.ts` — Zod 스키마 정의 + validateExportData
- `packages/time-tracker-core/src/__tests__/unit/export_schema.test.ts` — 스키마 검증 테스트 7개
- `docs/phase-plans/time-tracker/phase-2/manual-verification-guide.md` — Logseq 수동 검증 가이드

### 수정 파일
- `packages/time-tracker-core/src/services/data_export_service.ts` — importAll에 Zod 검증 연동
- `packages/time-tracker-core/src/types/index.ts` — export 추가
- `packages/time-tracker-core/package.json` — zod 의존성 추가
- `packages/logseq-time-tracker/src/main.ts` — SQLite 모드 전환 + beforeunload 개선
- `packages/logseq-time-tracker/src/App.svelte` — PoC 버튼 + 스토리지 모드 표시
- `pnpm-lock.yaml` — lock 업데이트

## 품질 지표

| 항목 | 결과 |
|---|---|
| 테스트 | 757 passed (100%) |
| format:check | 통과 |
| lint | 통과 |
| type-check | 통과 |
| build | 통과 |
| 보안 | Critical/High 없음 |
| 커밋 | e74d92a |

## 보안 권장사항 (Medium)

- Zod 배열에 `.max()` 추가 (DoS 방어)
- `settings` 키 allowlist + 위험 키(`__proto__` 등) 차단
- `custom_fields` 후속 JSON.parse에 추가 검증

## 결정사항

| 결정 | 근거 |
|---|---|
| Zod 4.x 사용 | pnpm에서 4.3.6이 resolve됨 |
| beforeunload에 flush→dispose 순서 보장 | registerTimerBeforeUnload 먼저 등록, dispose 리스너 후속 등록 |
| $derived.by 사용 (storage_mode_label) | Svelte 5 다중 문 파생값에 적합 |
