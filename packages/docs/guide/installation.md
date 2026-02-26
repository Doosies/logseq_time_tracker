# Installation

## 사전 요구사항

- Node.js 20 이상
- pnpm 9 이상

## pnpm 설치

```bash
npm install -g pnpm
```

## 프로젝트 클론

```bash
git clone https://github.com/yourusername/personal.git
cd personal
```

## 의존성 설치

```bash
pnpm install
```

pnpm 워크스페이스가 모든 패키지의 의존성을 설치하고 링크합니다.

## 개발 서버 실행

### 전체 (Turborepo)

```bash
pnpm dev
```

### UIKit 개발

```bash
cd packages/uikit
pnpm dev
```

### Ecount Dev Tool 개발

```bash
cd packages/ecount-dev-tool
pnpm dev
```

### Storybook 실행

```bash
pnpm storybook
```

UIKit과 Ecount Dev Tool 컴포넌트를 시각적으로 확인하고 인터랙션 테스트를 실행할 수 있습니다.

### 문서 사이트 실행

```bash
cd packages/docs
pnpm dev
```

## Chrome 확장프로그램 로드

Ecount Dev Tool을 Chrome에 로드하려면:

1. 빌드: `cd packages/ecount-dev-tool && pnpm build`
2. Chrome에서 `chrome://extensions/` 접속
3. "개발자 모드" 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭
5. `packages/ecount-dev-tool/dist/` 폴더 선택

## 빌드

### 전체 빌드

```bash
pnpm build
```

### 특정 패키지 빌드

```bash
cd packages/uikit
pnpm build
```

## 다음 단계

[빠른 시작](/guide/quick-start) 가이드를 확인하세요.
