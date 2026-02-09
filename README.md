# Personal Logseq Plugin Monorepo

React와 TypeScript로 작성된 Logseq 플러그인 및 문서화 모노레포입니다.

## 📦 패키지

- **[@personal/time-tracker](./packages/time-tracker)** - Logseq 플러그인
- **[@personal/docs](./packages/docs)** - VitePress 문서화 사이트
- **[@personal/mcp-server](./packages/mcp-server)** - Cursor용 MCP 서버
- **[@personal/ecount-dev-tool](./packages/ecount-dev-tool)** - 이카운트 개발 환경 관리 Chrome 확장프로그램
- **[@personal/uikit](./packages/uikit)** - Svelte 5 기반 공유 UI 컴포넌트 라이브러리

## 🚀 빠른 시작

### 사전 요구사항

- Node.js 20 이상
- pnpm 9 이상

### 설치

```bash
# pnpm 설치 (아직 없다면)
npm install -g pnpm

# 의존성 설치
pnpm install
```

### 개발

모든 패키지의 개발 서버를 동시에 실행:

```bash
pnpm dev
```

특정 패키지만 실행:

```bash
cd packages/time-tracker
pnpm dev
```

### 빌드

전체 빌드:

```bash
pnpm build
```

### 테스트

```bash
pnpm test
```

### 린트 & 포맷

```bash
pnpm lint
pnpm format
```

## 🛠️ 기술 스택

### 공통
- **pnpm** - 빠르고 효율적인 패키지 매니저
- **Turborepo** - 모노레포 빌드 시스템
- **TypeScript 5.9** - 타입 안전성
- **Prettier & ESLint** - 코드 품질

### Plugin
- **React 19** - UI 프레임워크
- **Vite 7.3** - 빌드 도구
- **Vitest 2.1** - 테스트 프레임워크
- **@logseq/libs** - Logseq SDK
- **Vanilla Extract** - 타입 안전한 CSS-in-TypeScript

### Docs
- **VitePress 1.5** - 문서화 사이트

### MCP Server
- **@modelcontextprotocol/sdk 1.25** - MCP SDK
- **Zod 3.24** - 스키마 검증

### UIKit
- **Svelte 5** - UI 프레임워크 (Runes API)
- **vanilla-extract** - 타입 안전한 CSS-in-TypeScript

### Ecount Dev Tool
- **Svelte 5** - UI 프레임워크
- **vite-plugin-web-extension** - Chrome Extension 빌드

## 📚 문서

자세한 문서는 [docs 사이트](./packages/docs)를 참조하세요.

로컬에서 문서 보기:

```bash
cd packages/docs
pnpm dev
```

## 🏗️ 프로젝트 구조

```
personal/
├── packages/
│   ├── time-tracker/        # Logseq 플러그인
│   │   ├── src/            # 소스 코드
│   │   ├── tests/          # 테스트
│   │   └── package.json
│   ├── docs/               # 문서화 사이트
│   │   ├── guide/          # 가이드
│   │   ├── api/            # API 문서
│   │   └── package.json
│   ├── mcp-server/         # MCP 서버
│   │   ├── src/            # 서버 코드
│   │   └── package.json
│   ├── ecount-dev-tool/    # Chrome 확장프로그램
│   │   ├── src/            # 소스 코드
│   │   │   ├── components/ # Svelte 컴포넌트
│   │   │   ├── services/   # 비즈니스 로직
│   │   │   ├── stores/     # Svelte Store
│   │   │   └── types/      # TypeScript 타입
│   │   └── package.json
│   └── uikit/              # 공유 UI 컴포넌트 라이브러리
│       ├── src/            # 소스 코드
│       │   ├── components/ # Svelte 컴포넌트
│       │   └── design/     # 디자인 시스템
│       └── package.json
├── turbo.json              # Turborepo 설정
├── pnpm-workspace.yaml     # pnpm 워크스페이스
└── package.json            # 루트 패키지
```

## 🔧 Turborepo 파이프라인

Turborepo가 다음 작업을 최적화합니다:

- `build` - 전체 빌드 (캐싱 지원)
- `dev` - 개발 서버 (병렬 실행)
- `test` - 테스트 실행
- `lint` - 린트 체크
- `format` - 코드 포맷팅

## 📖 Logseq에 플러그인 로드

1. 플러그인 빌드:
   ```bash
   cd packages/time-tracker
   pnpm build
   ```

2. Logseq 설정:
   - `Settings` → `Advanced` → `Developer mode` 활성화
   - `Plugins` → `Load unpacked plugin`
   - `packages/time-tracker` 디렉토리 선택

## 🚀 배포

### 플러그인 배포

GitHub Releases를 통해 배포됩니다. (자동화 설정 예정)

### MCP 서버 사용

Cursor에서 MCP 서버 사용:

1. 빌드:
   ```bash
   cd packages/mcp-server
   pnpm build
   ```

2. Cursor 설정에 추가:
   ```json
   {
     "mcpServers": {
       "personal": {
         "command": "node",
         "args": ["D:/personal/packages/mcp-server/dist/index.js"],
         "transport": "stdio"
       }
     }
   }
   ```

자세한 내용은 [MCP 서버 가이드](./packages/mcp-server/README.md)를 참조하세요.

### 문서 배포

GitHub Pages, Vercel, Netlify 등에 배포 가능:

```bash
cd packages/docs
pnpm build
# dist 폴더를 배포
```

## 📝 라이선스

MIT

## 🤝 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.
