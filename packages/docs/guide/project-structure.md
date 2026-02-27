# Project Structure

## 모노레포 구조

```
personal/
├── packages/
│   ├── uikit/              # Svelte 5 UI 컴포넌트 라이브러리
│   ├── ecount-dev-tool/    # Chrome 확장프로그램
│   ├── mcp-server/         # Cursor MCP 서버
│   ├── time-tracker/       # Logseq 플러그인
│   └── docs/               # VitePress 문서 사이트
├── .storybook/             # Storybook 전역 설정
├── turbo.json              # Turborepo 설정
├── pnpm-workspace.yaml     # pnpm 워크스페이스
├── eslint.config.ts        # ESLint 통합 설정
└── package.json            # 루트 패키지
```

## UIKit 패키지

```
packages/uikit/
├── src/
│   ├── primitives/        # Headless primitive 컴포넌트 (11개)
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Section/
│   │   ├── Popover/
│   │   ├── Toast/
│   │   ├── Dnd/
│   │   └── ...
│   ├── components/        # Styled compound 컴포넌트 (11개)
│   │   ├── Button/
│   │   ├── Card/          # Root, Header, Body, Footer
│   │   ├── Section/       # Root, Header, Title, Action, Content
│   │   ├── Popover/       # Root, Trigger, Content
│   │   ├── Toast/         # Provider, Root
│   │   ├── CheckboxList/  # Root, Item
│   │   ├── Dnd/           # Zone, Row, Handle
│   │   └── ...
│   ├── actions/           # Svelte actions (clickOutside 등)
│   ├── design/            # vanilla-extract 디자인 시스템
│   │   ├── theme/         # Light/Dark 테마, 디자인 토큰
│   │   └── styles/        # 컴포넌트별 스타일
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Ecount Dev Tool 패키지

```
packages/ecount-dev-tool/
├── src/
│   ├── components/        # Svelte 컴포넌트
│   │   ├── App/           # 루트 컴포넌트
│   │   ├── QuickLoginSection/
│   │   ├── ServerManager/
│   │   ├── StageManager/
│   │   ├── ActionBar/
│   │   └── SectionSettings/
│   ├── services/          # 비즈니스 로직
│   │   ├── url_service.ts
│   │   ├── tab_service.ts
│   │   └── page_actions.ts
│   ├── stores/            # Svelte 5 Runes 스토어
│   ├── types/
│   ├── constants/
│   ├── manifest.json      # Chrome Extension Manifest
│   └── popup.ts           # Entry Point
└── package.json
```

## MCP Server 패키지

```
packages/mcp-server/
├── src/
│   ├── index.ts           # 메인 서버
│   ├── tools/             # MCP 도구 정의
│   └── resources/         # MCP 리소스 정의
└── package.json
```

## Time Tracker 패키지

```
packages/time-tracker/
├── src/
│   ├── main.tsx           # 플러그인 진입점
│   └── App.tsx            # React 컴포넌트
├── tests/
└── package.json
```

## Docs 패키지

```
packages/docs/
├── .vitepress/
│   └── config.ts          # VitePress 설정
├── guide/                 # 가이드 문서
├── api/                   # API 레퍼런스
└── package.json
```

## 주요 설정 파일

### turbo.json

Turborepo 파이프라인: 빌드, 테스트, 린트 작업의 캐싱과 병렬 실행을 관리합니다.

### eslint.config.ts

통합 ESLint 설정: Svelte, TypeScript 규칙을 중앙에서 관리하며 각 패키지에 `tsconfigRootDir`을 전달합니다.

### pnpm-workspace.yaml

패키지 워크스페이스 정의와 의존성 catalog을 포함합니다.

## 다음 단계

- [설정](/guide/configuration) 커스터마이징
- [테스트](/guide/testing) 작성하기
- [Storybook](/guide/storybook) 컴포넌트 개발
