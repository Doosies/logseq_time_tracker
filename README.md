# Personal Logseq Plugin Monorepo

Svelte 5와 TypeScript로 작성된 Logseq 플러그인 및 문서화 모노레포입니다.

## 📦 패키지

- **[@personal/logseq-time-tracker](./packages/logseq-time-tracker)** - Logseq 플러그인
- **[@personal/time-tracker-core](./packages/time-tracker-core)** - Time Tracker 코어 라이브러리 (도메인 로직, 타입, Svelte 5 UI)
- **[@personal/cr-rag-mcp](./packages/cr-rag-mcp)** - Git 커밋 히스토리 기반 코드 리뷰 RAG MCP 서버
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
pnpm install --no-offline
```

참고: `.npmrc`에 `offline=true` 설정이 있어 레지스트리 접근 시 `--no-offline`으로 명시적 해제가 필요합니다.

### 개발

모든 패키지의 개발 서버를 동시에 실행:

```bash
pnpm dev
```

특정 패키지만 실행:

```bash
cd packages/logseq-time-tracker
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

### Storybook

UI 컴포넌트 개발 및 시각적 테스트:

```bash
pnpm storybook
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
- **Svelte 5** - UI 프레임워크 (Runes API)
- **Vite 7.3** - 빌드 도구
- **Vitest 2.1** - 테스트 프레임워크
- **@logseq/libs** - Logseq SDK
- **Vanilla Extract** - 타입 안전한 CSS-in-TypeScript

### Docs
- **VitePress 1.5** - 문서화 사이트

### MCP Server
- **@modelcontextprotocol/sdk ^1.27.1** - MCP SDK
- **Zod 3.24** - 스키마 검증
- **chromadb** - 벡터 데이터베이스 (cr-rag-mcp)
- **openai** - LLM 요약 (cr-rag-mcp)
- **simple-git** - Git 커밋 수집 (cr-rag-mcp)

### UIKit
- **Svelte 5** - UI 프레임워크 (Runes API)
- **vanilla-extract** - 타입 안전한 CSS-in-TypeScript

### Ecount Dev Tool
- **Svelte 5** - UI 프레임워크
- **vite-plugin-web-extension** - Chrome Extension 빌드

### 테스트/문서
- **Vitest** - 단위/통합 테스트
- **Storybook 10** - UI 컴포넌트 개발 및 인터랙션 테스트
- **@testing-library/svelte** - 컴포넌트 테스트 유틸리티

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
│   ├── logseq-time-tracker/  # Logseq 시간 추적 플러그인 (Svelte 5)
│   │   ├── src/
│   │   └── package.json
│   ├── time-tracker-core/    # Time Tracker 코어 라이브러리
│   │   ├── src/
│   │   └── package.json
│   ├── cr-rag-mcp/           # 코드 리뷰 RAG MCP 서버
│   │   ├── src/
│   │   └── package.json
│   ├── docs/                 # VitePress 문서화 사이트
│   │   ├── guide/
│   │   ├── api/
│   │   └── package.json
│   ├── mcp-server/           # Cursor용 MCP 서버
│   │   ├── src/
│   │   └── package.json
│   ├── ecount-dev-tool/      # Chrome 확장프로그램
│   │   ├── src/
│   │   └── package.json
│   └── uikit/                # 공유 UI 컴포넌트 라이브러리
│       ├── src/
│       └── package.json
├── docs/                     # 설계 문서 및 페이즈 플랜
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
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
   cd packages/logseq-time-tracker
   pnpm build
   ```

2. Logseq 설정:
   - `Settings` → `Advanced` → `Developer mode` 활성화
   - `Plugins` → `Load unpacked plugin`
   - `packages/logseq-time-tracker` 디렉토리 선택

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
