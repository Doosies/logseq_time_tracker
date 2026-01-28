# Project Structure

## 모노레포 구조

```
personal/
├── packages/
│   ├── plugin/              # Logseq 플러그인
│   └── docs/                # 문서화 사이트
├── turbo.json              # Turborepo 설정
├── pnpm-workspace.yaml     # pnpm 워크스페이스
└── package.json            # 루트 패키지
```

## Plugin 패키지

```
packages/plugin/
├── src/
│   ├── main.tsx           # 플러그인 진입점
│   └── App.tsx            # React 컴포넌트
├── tests/
│   ├── setup.ts           # Vitest 설정
│   ├── example.test.ts    # 예제 테스트
│   └── App.test.tsx       # 컴포넌트 테스트
├── index.html             # HTML 엔트리
├── logo.svg               # 플러그인 아이콘
├── vite.config.ts         # Vite 설정
├── tsconfig.json          # TypeScript 설정
└── package.json           # 패키지 설정
```

## Docs 패키지

```
packages/docs/
├── .vitepress/
│   └── config.ts          # VitePress 설정
├── guide/
│   ├── index.md           # 가이드 홈
│   ├── installation.md    # 설치 가이드
│   └── quick-start.md     # 빠른 시작
├── api/
│   └── index.md           # API 문서
├── index.md               # 문서 홈
└── package.json           # 패키지 설정
```

## 주요 파일 설명

### `main.tsx`

플러그인의 진입점입니다. Logseq API 초기화와 React 렌더링을 담당합니다.

### `App.tsx`

메인 React 컴포넌트입니다. 플러그인 UI를 정의합니다.

### `vite.config.ts`

Vite와 Vitest 설정을 포함합니다. `vite-plugin-logseq` 플러그인이 HMR을 활성화합니다.

### `turbo.json`

Turborepo 파이프라인을 정의합니다. 빌드, 테스트, 린트 작업의 실행 순서와 캐싱을 관리합니다.

## 다음 단계

- [설정](/guide/configuration) 커스터마이징
- [테스트](/guide/testing) 작성하기
