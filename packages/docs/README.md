# @personal/docs

Documentation site for Personal Logseq Plugin

VitePress 기반 문서화 사이트입니다. Personal 모노레포의 모든 패키지에 대한 가이드와 API 문서를 제공합니다.

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [문서 구조](#문서-구조)
- [로컬에서 실행](#로컬에서-실행)
- [빌드](#빌드)
- [배포](#배포)
- [문서 작성 가이드](#문서-작성-가이드)

## 🚀 프로젝트 소개

이 문서 사이트는 Personal 모노레포의 모든 패키지에 대한 문서를 중앙화하여 제공합니다:

- **Time Tracker 플러그인**: Logseq 플러그인 개발 가이드
- **MCP Server**: Cursor MCP 서버 사용 가이드
- **기술 문서**: Vanilla Extract, Logseq Plugin API 등

## 📚 문서 구조

```
packages/docs/
├── guide/                    # 가이드 문서
│   ├── index.md             # 시작하기
│   ├── quick-start.md       # 빠른 시작
│   ├── installation.md      # 설치 가이드
│   ├── configuration.md     # 설정 가이드
│   ├── project-structure.md # 프로젝트 구조
│   ├── testing.md           # 테스트 가이드
│   ├── logseq-plugin-api.md # Logseq Plugin API
│   ├── vanilla-extract.md   # Vanilla Extract 가이드
│   └── mcp-server.md        # MCP 서버 가이드
├── api/                      # API 문서
│   ├── index.md             # API 개요
│   ├── components.md         # 컴포넌트 API
│   ├── hooks.md             # 훅 API
│   └── utils.md             # 유틸리티 API
├── .vitepress/
│   └── config.ts            # VitePress 설정
└── index.md                 # 홈페이지
```

## 🛠️ 로컬에서 실행

### 사전 요구사항

- Node.js 20 이상
- pnpm 9 이상

### 개발 서버 실행

```bash
# 모노레포 루트에서
pnpm dev

# 또는 이 패키지 디렉토리에서
cd packages/docs
pnpm dev
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173` (또는 다른 포트)로 접속할 수 있습니다.

파일 변경 시 자동으로 리로드됩니다.

### 미리보기

빌드된 사이트를 미리보기:

```bash
pnpm build
pnpm preview
```

## 📦 빌드

```bash
pnpm build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

## 🚀 배포

### GitHub Pages

1. 빌드:
   ```bash
   pnpm build
   ```

2. `dist/` 디렉토리를 GitHub Pages에 배포

### Vercel

Vercel에 배포하려면:

1. Vercel 프로젝트에 연결
2. 빌드 명령어: `pnpm build`
3. 출력 디렉토리: `dist`

### Netlify

Netlify에 배포하려면:

1. Netlify 프로젝트에 연결
2. 빌드 명령어: `pnpm build`
3. 게시 디렉토리: `dist`

## 📝 문서 작성 가이드

### Markdown 사용

VitePress는 표준 Markdown을 지원하며, 추가 기능도 제공합니다:

- **Frontmatter**: 문서 메타데이터
- **코드 블록**: 구문 강조 지원
- **내부 링크**: 자동 라우팅
- **외부 링크**: 자동 새 탭 열기

### 문서 작성 예시

```markdown
---
title: 문서 제목
description: 문서 설명
---

# 문서 제목

내용...

## 섹션

더 많은 내용...

\`\`\`typescript
// 코드 예시
const example = 'Hello, World!';
\`\`\`
```

### VitePress 기능

- **코드 블록**: 언어별 구문 강조
- **내부 링크**: `[링크 텍스트](./guide/quick-start.md)`
- **외부 링크**: `[외부 링크](https://example.com)`
- **이미지**: `![이미지 설명](./image.png)`
- **알림**: `::: tip`, `::: warning`, `::: danger`

### 포맷팅

```bash
# 포맷 적용
pnpm format

# 포맷 체크
pnpm format:check
```

## 🛠️ 기술 스택

- **VitePress 1.6** - 정적 사이트 생성기
  - Vue 3 기반
  - 빠른 개발 서버
  - 자동 라우팅
  - 검색 기능

## 📝 라이센스

MIT

## 🤝 기여

문서 개선 제안은 언제나 환영합니다! Pull Request를 보내주세요.

---

**버전**: 0.1.0  
**최종 업데이트**: 2026-02-06
