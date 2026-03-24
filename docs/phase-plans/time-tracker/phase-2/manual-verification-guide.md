# Logseq Time Tracker — Phase 2 SQLite 수동 검증 가이드

Phase 2에서 SQLite 영속화가 Logseq 환경에서 기대대로 동작하는지, 사용자가 직접 확인할 수 있는 절차를 정리합니다.

---

## 1. 빌드 절차

저장소 루트가 아니라 플러그인 패키지 디렉터리에서 빌드합니다.

```bash
cd packages/logseq-time-tracker
pnpm build
```

- **빌드 결과물**: `dist/` 디렉터리 (Logseq에 로드할 unpacked 플러그인 루트).
- **필수 확인**: `dist/assets/sql-wasm.wasm` 파일이 있어야 합니다. 없으면 sql.js 초기화가 실패하고 Memory Fallback으로 동작할 수 있습니다.
- `prebuild` 단계에서 `scripts/copy_sql_wasm.mjs`가 `sql.js` 패키지의 WASM을 `public/assets/`로 복사한 뒤, Vite 빌드가 이를 `dist/assets/`에 포함합니다.

---

## 2. Logseq 플러그인 로드 방법

1. Logseq를 실행합니다.
2. **설정** → **플러그인**으로 이동합니다.
3. **개발자 모드**를 켭니다.
4. **unpacked 플러그인 로드**를 클릭합니다.
5. 파일 선택 대화상자에서 **`packages/logseq-time-tracker/dist`** 폴더를 선택합니다. (빌드 산출물이 있는 `dist` 루트를 지정합니다.)
6. 툴바에 **Time Tracker** 아이콘이 나타나는지 확인합니다.

---

## 3. Storage PoC 검증 (디버그 모달)

1. Time Tracker 패널을 엽니다.
2. 우측 상단 **시계(🕐)** 아이콘을 클릭해 디버그 모달을 엽니다.
3. 스크롤을 내려 **스토리지 상태** 섹션을 확인합니다.
4. **현재 모드**를 확인합니다: `SQLite` 또는 `Memory Fallback (...)` 등으로 표시됩니다.
5. **Storage PoC 검증 실행** 버튼을 클릭합니다.
6. 결과 테이블을 확인합니다.
   - **sql.js 초기화**: `PASS` 기대
   - **OPFS 접근**: `PASS` 또는 `FAIL` — Logseq iframe 환경에서는 OPFS가 제한될 수 있음
   - **IndexedDB**: `PASS` 기대

---

## 4. 영속화 검증

### 기본 검증

1. **작업 추가**: **+ 새 작업** → 작업명 입력 → 확인.
2. **타이머 시작**: 작업을 선택한 뒤 **시작** 버튼을 누릅니다.
3. **10초 이상** 대기한 뒤 **완료** 또는 **일시정지**합니다.
4. Logseq를 **완전히 종료**합니다.
5. Logseq를 다시 실행합니다.
6. Time Tracker 패널을 엽니다.
7. **확인**: 이전에 추가한 작업이 목록에 그대로 있는지.
8. **확인**: 디버그 모달에서 시간 기록이 유지되는지.

### 타이머 상태 복원 검증

1. 타이머가 **실행 중**인 상태에서 Logseq를 종료합니다.
2. 재시작 후 타이머 상태가 복원되어 **계속 실행**되는지 확인합니다.

---

## 5. Fallback 검증

1. `dist/assets/sql-wasm.wasm` 파일 이름을 임시로 바꿉니다. (예: `sql-wasm.wasm.bak`)
2. Logseq를 재시작합니다.
3. 플러그인 UI가 여전히 열리고 기본 동작이 가능한지 확인합니다 (Memory Fallback).
4. 디버그 모달에서 스토리지 모드가 **Memory Fallback**으로 표시되는지 확인합니다.
5. **주의**: Fallback 모드에서는 세션 메모리에만 데이터가 있으므로 **Logseq 종료 시 데이터가 사라집니다**. 중요한 작업 데이터는 이 상태에서 쌓지 마세요.
6. 검증이 끝나면 파일명을 **`sql-wasm.wasm`**으로 되돌립니다.

---

## 6. 기대 결과

| 검증 항목 | 기대 결과 |
| --- | --- |
| PoC: sql.js 초기화 | PASS |
| PoC: OPFS 접근 | PASS 또는 FAIL (iframe 제한 가능) |
| PoC: IndexedDB | PASS |
| 스토리지 모드 (정상) | SQLite |
| 데이터 영속화 | 작업·시간 기록 유지 |
| 타이머 상태 복원 | 재시작 후 복원 |
| WASM 누락 시 | Memory Fallback 전환 |

---

## 7. 트러블슈팅

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| "Memory Fallback" 표시 | WASM 파일 누락 또는 로드 실패 | `dist/assets/sql-wasm.wasm` 존재 여부 확인, `pnpm build` 재실행 |
| PoC sql.js FAIL | WASM 경로·복사 실패 또는 URL 불일치 | `package.json`의 `prebuild`(`scripts/copy_sql_wasm.mjs`)가 성공했는지, `public/assets/sql-wasm.wasm` 및 `dist/assets/sql-wasm.wasm` 확인 |
| 모든 PoC FAIL | Cross-origin 등 제한 | Logseq iframe·CSP 설정 확인 |
| 데이터 사라짐 | Memory Fallback 상태 | 디버그 모달에서 모드 확인 후 SQLite 경로 복구(WASM·빌드) |
| 빌드 실패 | 의존성 누락 | 저장소 루트에서 `pnpm install --no-offline` 후 다시 빌드 |

의존성 설치는 워크스페이스 정책에 따라 레지스트리 접근이 필요할 때 `--no-offline`을 사용합니다.
