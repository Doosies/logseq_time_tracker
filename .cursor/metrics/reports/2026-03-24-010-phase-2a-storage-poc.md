# 작업 완료 보고서

**작업 일자**: 2026-03-24  
**작업 ID**: 2026-03-24-010  
**요청 내용**: Phase 2A — Logseq iframe 환경에서 sql.js WASM + OPFS/IndexedDB Storage PoC 및 Vite 산출물에 WASM 포함

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 작업 유형 | Feature (PoC) |
| 주요 변경 영역 | `packages/time-tracker-core`, `packages/logseq-time-tracker`, 루트 `.gitignore` |
| 커밋 | 미실행 (git-workflow 미요청) |

---

## 2. 수행한 작업

- `time-tracker-core`: `sql.js` 의존성, `@types/sql.js` devDependency, PoC 모듈 및 Vitest 스모크 테스트, `storage` barrel에 `sqlite` export.
- `logseq-time-tracker`: `prebuild` + `scripts/copy_sql_wasm.mjs`로 `sql-wasm.wasm`을 `public/assets/`에 복사 → Vite 빌드 시 `dist/assets/sql-wasm.wasm`에 포함. `dev` 시작 시에도 동일 복사. `sql.js`는 `require.resolve`용 **devDependency**로 추가.
- 검증: `pnpm --filter @personal/time-tracker-core run test` / `type-check` / `lint`, `pnpm --filter @personal/logseq-time-tracker run build` / `type-check` / `lint`, 변경 파일 ReadLints.

---

## 3. 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| PoC 모듈에 `node:` 의존성 없음 | Logseq 번들(브라우저)에서 그대로 import 가능해야 함 | 초안의 `createRequire`/path 헬퍼 제거 |
| WASM 배포: `prebuild` + `public/assets` 복사 | `vite-plugin-static-copy`는 절대 경로 시 중첩 디렉터리로 복사되거나 `stripBase` 적용 시 파일 누락이 발생 | `vite-plugin-static-copy`, `rename`만 사용 |
| `wasm_url`을 **베이스 URL(선택적 `/`)** 으로 해석 | `locateFile`은 파일명(`sql-wasm.wasm` 등)을 받으므로 단일 문자열로 전체 URL을 고정하면 확장성이 없음 | 스펙의 `wasm_url \|\| /assets/${file}` 리터럴(동일 문자열 반환) |
| `logseq-time-tracker`에 `sql.js` devDependency | 복사 스크립트가 `require.resolve('sql.js/dist/sql-wasm.wasm')`로 경로를 잡기 위해 패키지 그래프에 `sql.js`가 필요함 | 코어 패키지 경로 하드코딩 |
| `@types/sql.js` 추가 | 배포 `sql.js` 패키지에 `types` 필드 없음 | 타입 무시 또는 수동 선언 |

---

## 4. 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| `require.resolve('sql.js/package.json')`가 `exports`에 없어 Vite 설정 로드 실패 | `sql.js/dist/sql-wasm.wasm`만 resolve | minor |
| `vite-plugin-static-copy`가 `dist/assets`에 깊은 `node_modules/...` 경로로 복사 | `rename: 'sql-wasm.wasm'`도 중첩 유지 | minor |
| `rename: { stripBase: true }` 시 WASM이 `dist`에 복사되지 않음 | 플러그인 대신 `public` 복사 스크립트로 전환 | minor |
| `logseq-time-tracker`만으로는 `sql.js` 모듈 해석 불가 | 동일 버전 `sql.js` devDependency 추가 | minor |

---

## 5. 품질 지표

| 지표 | 결과 |
|------|------|
| ReadLints (지정 변경 파일) | 0건 |
| time-tracker-core 테스트 | 163/163 통과 |
| time-tracker-core type-check / lint | 통과 |
| logseq-time-tracker build / type-check / lint | 통과 |
| 빌드 산출물 | `dist/assets/sql-wasm.wasm` 존재 확인 |

---

## 6. 후속 제안

- Logseq UI에서 `runAllPocTests()`를 호출해 실제 iframe/보안 컨텍스트에서 OPFS·IndexedDB 결과를 확인.
- 루트 `pnpm` catalog에 `sql.js` 버전을 올려 두면 코어·플러그인 버전 드리프트를 줄일 수 있음.
