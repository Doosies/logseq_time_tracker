# @personal/logseq-time-tracker

**Time Tracker Logseq Plugin with Svelte 5** — Logseq 안에서 작업 시간을 추적하는 플러그인입니다. `@personal/time-tracker-core`의 UI·도메인 로직을 쓰고, SQLite(sql.js) 기반 로컬 저장소로 기록을 유지합니다.

## 기술 스택

| 구분 | 사용 |
| --- | --- |
| UI | **Svelte 5** (Runes), **Vanilla Extract** (`@vanilla-extract/css`) |
| 언어 | **TypeScript** |
| 번들 | **Vite** (`vite-plugin-logseq` 개발 서버 연동) |
| 플랫폼 | **@logseq/libs** |
| 공유 로직 | **@personal/time-tracker-core** (workspace 패키지) |

## 개발

모노레포 루트에서 의존성을 설치한 뒤, 이 패키지 디렉터리에서 개발 서버를 띄웁니다.

```bash
# 저장소 루트 (예시)
pnpm install --no-offline

# 이 패키지에서
cd packages/logseq-time-tracker
pnpm dev
```

`dev`는 `sql-wasm` 자산 복사 후 Vite를 실행합니다. Logseq와 연동해 UI를 확인하려면 아래 **Logseq에서 로드하는 방법**을 참고하세요.

루트에서 필터로 실행하려면:

```bash
pnpm --filter @personal/logseq-time-tracker dev
```

## 빌드

```bash
cd packages/logseq-time-tracker
pnpm build
```

산출물은 `dist/`에 생성되며, `package.json`의 `logseq.main`과 동일하게 **`dist/index.html`** 이 진입점입니다. Logseq에 로드할 때는 **빌드 후** `packages/logseq-time-tracker` 폴더를 선택하는 것이 안전합니다.

`prebuild`에서 `copy_sql_wasm.mjs`가 실행되어 WASM 자산이 준비됩니다.

## Logseq에서 로드하는 방법

1. Logseq에서 **설정 → 고급**으로 이동합니다.
2. **Developer mode**를 켭니다.
3. 왼쪽 사이드바 **플러그인**에서 **Load unpacked plugin**을 선택합니다.
4. 이 저장소의 **`packages/logseq-time-tracker`** 디렉터리를 선택합니다.  
   - 배포/검증 시에는 `pnpm build`로 `dist`가 갱신된 상태를 권장합니다.

플러그인이 로드되면 툴바에 Time Tracker 아이콘이 나타나고, 슬래시 명령 **`Time Tracker`** 로 메인 UI를 열 수 있습니다.

## 스크립트 (`package.json`)

| 스크립트 | 설명 |
| --- | --- |
| `prebuild` | 빌드 전 `scripts/copy_sql_wasm.mjs`로 SQL WASM 등 자산 복사 |
| `dev` | WASM 복사 후 Vite 개발 서버 (`vite-plugin-logseq`) |
| `dev:playwright` | E2E용 별도 Vite 설정, 포트 5174 |
| `build` | 프로덕션 번들 (`vite build`) |
| `type-check` | `tsc --noEmit` + `svelte-check` |
| `lint` | ESLint (ts, svelte) |
| `format` | Prettier로 `src/**/*.{ts,svelte,json,css.ts}` 작성 |
| `format:check` | 위 경로 Prettier 검사만 |
| `test` | Vitest 일회 실행 (`--passWithNoTests`) |
| `test:watch` | Vitest 워치 모드 |
| `test:e2e` | Playwright E2E |
| `test:e2e:update-snapshots` | Playwright 스냅샷 갱신 |

## 프로젝트 구조 (`src/`)

```
src/
├── main.ts              # Logseq 진입: ready 훅, UI 등록, time-tracker-core 초기화, Svelte mount
├── App.svelte           # 메인 UI: 툴바/풀뷰, 스토리지 배너, 디버그 모달
├── vite-env.d.ts        # Vite 타입 참조
├── test/
│   └── setup.ts         # Vitest 셋업
└── __tests__/
    └── main.test.ts     # main 관련 단위 테스트
```

## 라이선스

MIT (`package.json`과 동일)
