# Phase 2A: Storage PoC

## 목표

Logseq iframe 환경에서 sql.js와 OPFS·IndexedDB 조합의 실현 가능성을 검증하고, Phase 2B 이후에 사용할 스토리지 백엔드(primary / fallback)를 확정할 근거를 마련합니다.

---

## 선행 조건

- Phase 1 완료 — MemoryAdapter 기반 프로토타입 동작
- 모노레포 환경 정상 동작 (pnpm workspace + turbo)

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 내용 |
|------|------|-----------|
| `05-storage.md` | §OPFS + SQLite | sql.js 초기화, OPFS/IndexedDB와의 연동 개요 |
| `05-storage.md` | §OPFS iframe 제약 | `createSyncAccessHandle` 등 제약, fallback 전략 |
| `05-storage.md` | §Storage Fallback | 초기화·런타임 실패 시 MemoryAdapter 전환 방향 |

---

## 생성/변경 파일 목록

| 파일 (time-tracker-core 기준) | 역할 |
|------------------------------|------|
| `adapters/storage/sqlite/poc_storage_test.ts` | OPFS·IndexedDB·sql.js WASM 검증용 유틸 및 수동/자동 검증 진입점 (Phase 2A 구현 시 작성) |

PoC 코드는 본 Phase 2A 구현 작업에서 추가합니다. 본 문서는 계획과 검증 범위만 정의합니다.

검증이 끝나면 **결정 사항**(선택한 primary 백엔드, iframe 제약 여부, 2B 적용 메모)을 본 파일 하단에 「검증 결과·결정」절을 추가하거나, 동일 폴더의 짧은 부록 문서로 남깁니다.

---

## 구현 상세

### 검증 항목 1: sql.js WASM 로드

- `sql.js` 패키지 설치: `pnpm add sql.js --no-offline` (해당 패키지가 속한 워크스페이스 기준)
- 초기화: `initSqlJs({ locateFile: (file) => \`/assets/${file}\` })` 또는 안정적인 CDN 경로
- Vite에서 WASM 등 정적 자산 배치: `vite.config.ts`의 `viteStaticCopy` 또는 `public/` 복사로 빌드 산출물에 포함
- **완료 정의**: Logseq 플러그인 iframe 내에서 WASM 초기화가 오류 없이 완료됨

### 검증 항목 2: OPFS 접근 검증

- `navigator.storage.getDirectory()` 호출 가능 여부
- `FileSystemDirectoryHandle.getFileHandle()` 가능 여부
- `FileSystemFileHandle.getFile()` / `createWritable()`(비동기 API) 가능 여부
- iframe sandbox·권한·브라우저 조합으로 위 API가 실패하는 경우, **실패 증상과 환경**(브라우저, Logseq 버전 등)을 기록

### 검증 항목 3: IndexedDB fallback 검증

- `indexedDB.open('time-tracker-db')` 가능 여부
- DB 바이너리(`Uint8Array`)를 IndexedDB에 저장·로드
- sql.js: `new Database(buffer)` → 스키마 없이도 `db.run` 등으로 변경 → `db.export()` → IndexedDB에 다시 저장하는 **왕복** 테스트

### PoC 구현 파일 (계획)

| 파일 (time-tracker-core 기준) | 역할 |
|------------------------------|------|
| `adapters/storage/sqlite/poc_storage_test.ts` | 위 3항목을 점검하는 헬퍼·로그·(가능 시) Vitest 스모크 |

### 검증 결과 판단 기준

| 결과 | 결정 |
|------|------|
| OPFS + sql.js 성공 | OPFS를 primary, IndexedDB를 fallback |
| OPFS 실패 + IndexedDB 성공 | IndexedDB를 primary, Memory를 fallback |
| 둘 다 실패 | Memory만 사용, Phase 2 범위 축소 검토 |

---

## 완료 기준

- [ ] sql.js WASM이 Logseq iframe에서 로드됨
- [ ] OPFS 또는 IndexedDB 중 하나 이상에서 DB 바이너리 읽기·쓰기 성공
- [ ] 검증 결과에 따라 2B 이후 스토리지 백엔드 확정
- [ ] 결정 문서 작성(본 문서 갱신 또는 부록)

---

## 다음 단계

→ Phase 2B: sql.js Adapter & Schema Migration (`2b-sqlite-adapter.md`)
