# 사이클 보고: 2026-03-24-005 — logseq-time-tracker Phase 0 스캐폴드

## 요약

`packages/logseq-time-tracker/` 최소 Logseq 플러그인 패키지를 추가했다. Vite + Svelte 5 + `vite-plugin-logseq`(CJS `createRequire`) + vanilla-extract로 빌드하며, `@personal/time-tracker-core`의 `PocTest`를 `mount()`로 렌더링한다.

## 품질 게이트

| 항목        | 결과 |
| ----------- | ---- |
| ReadLints   | 통과 |
| type-check  | 통과 |
| lint        | 통과 |
| test        | 통과 (테스트 파일 없음) |
| build       | 통과 (`pnpm build --filter @personal/logseq-time-tracker`) |

## 생성·수정 파일

- `packages/logseq-time-tracker/package.json`
- `packages/logseq-time-tracker/vite.config.ts`
- `packages/logseq-time-tracker/svelte.config.js`
- `packages/logseq-time-tracker/tsconfig.json`
- `packages/logseq-time-tracker/index.html`
- `packages/logseq-time-tracker/src/main.ts`
- `packages/logseq-time-tracker/logo.svg` (time-tracker와 동일)
- `packages/logseq-time-tracker/eslint.config.ts`

## 결정사항

| 결정 | 근거 | 검토한 대안 |
| ---- | ---- | ----------- |
| `svelte-check`를 devDependencies에 명시 | `type-check` 스크립트에 필요 | 루트 호이스트에만 의존 (명시적 의존성이 유지보수에 유리) |
| `tsconfig`에 `vite/client` 타입 추가 | Vite 환경·import.meta 등 | `/// reference` 단일 파일 (패키지 전역 설정이 낫다고 판단) |
| ESLint에 `logseq` 전역 `readonly` | `import '@logseq/libs'`만으로 전역 사용 | `@types` 별도 패키지 (불필요) |
| `main.ts`에서 루트 요소명 `app_root` | 변수 snake_case 컨벤션 | `target`만 사용 (규칙 불일치) |

## 이슈

| 이슈 | 해결 방법 | 영향도 |
| ---- | --------- | ------ |
| 없음 | — | — |

## 다음 단계 (선택)

- Logseq에서 `pnpm dev` 후 플러그인 로드로 iframe CSS 검증
- 필요 시 기존 React `time-tracker`와 동일하게 `setMainUIInlineStyle` 등 UI 위치 조정
