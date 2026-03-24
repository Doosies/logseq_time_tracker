# 작업 완료 보고서

**작업 일자**: 2026-03-24  
**작업 ID**: 2026-03-24-011  
**요청 내용**: Phase 2B — sql.js `SqliteAdapter`, `IStorageBackend`(OPFS/IndexedDB), forward-only `MigrationRunner`, Phase 1+2 DDL 및 단위 테스트

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 작업 유형 | Feature |
| 주요 변경 영역 | `packages/time-tracker-core` — `src/adapters/storage/sqlite/`, `src/__tests__/unit/` |
| 커밋 | 미실행 (git-workflow 사용자 요청 시) |

---

## 2. 수행한 작업

- `IStorageBackend`, `OpfsBackend`, `IndexedDbBackend`, `SqliteAdapter`, `MigrationRunner`, `migrations/001_initial`, `migrations/002_phase2`, `migrations/index.ts`, `sqlite/index.ts` barrel 확장
- 단위 테스트: `migration_runner.test.ts`, `sqlite_adapter.test.ts` (`@vitest-environment node`로 sql.js Node 번들 사용)
- 검증: format, `pnpm run test`, `pnpm run lint`, `pnpm run type-check`, `pnpm run build` (`@personal/time-tracker-core`)

---

## 3. 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| `schema_version`는 `MigrationRunner`가 `INSERT OR REPLACE`로 통일 관리 | 스펙의 BEGIN/up/COMMIT 흐름과 중복 없이 버전 일관성 유지 | 각 마이그레이션 SQL 안에 버전 갱신 포함(중복·불일치 위험) |
| `SqliteAdapterOptions.wasm_url`을 선택적으로 두고, 비어 있으면 `initSqlJs()` 단독 호출 | Node 테스트·도구 환경에서 `locateFile` 없이 동작 | 항상 필수 URL(테스트에서 파일 경로 조립 부담) |
| OPFS `write` 시 `Uint8Array`를 새 버퍼에 복사 후 `write` | `FileSystemWriteChunkType`와 `Uint8Array<ArrayBufferLike>` 타입 불일치 해소 | 타입 단언만 사용(런타임은 동일하나 TS 경고 지속 가능) |
| sql.js 단위 테스트에 `@vitest-environment node` | 공유 Vitest 설정이 `conditions: ['browser']`라 브라우저 번들이 wasm fetch 실패 | Vite 별칭으로 `sql.js`를 Node 엔트리로 고정(패키지 전역 영향) |

---

## 4. 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| Vitest 기본 환경에서 `initSqlJs()`가 `sql-wasm-browser`를 쓰며 wasm 로드 실패 | 해당 테스트 파일에 `@vitest-environment node` 지정 | minor |
| OPFS `writable.write(Uint8Array)`가 TS에서 `FileSystemWriteChunkType`와 충돌 | 복사본 `Uint8Array`로 전달 | none |

---

## 5. 품질 지표

| 지표 | 결과 |
|------|------|
| ReadLints (변경 파일) | 0건 |
| 테스트 | 171/171 통과 |
| type-check + svelte-check | 통과 |
| lint | 통과 |
| build (`time-tracker-core`) | 통과 |

---

## 6. 시스템 개선 (7단계 메모)

- sql.js를 쓰는 신규 Vitest 파일은 **Node 환경** 또는 **명시적 wasm 경로**가 필요함을 사이클에서 기록함. 필요 시 `.cursor/skills/project-knowledge`에 한 줄 가이드 추가를 검토할 수 있음.

---

## 7. 완료 기준 대응

- [x] IStorageBackend / OpfsBackend / IndexedDbBackend / SqliteAdapter / MigrationRunner  
- [x] 001·002 DDL 및 `ALL_MIGRATIONS`  
- [x] barrel export 확장  
- [x] 단위 테스트·ReadLints·type-check  
