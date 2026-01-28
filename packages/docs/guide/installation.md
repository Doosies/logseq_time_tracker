# Installation

## 사전 요구사항

- Node.js 20 이상
- pnpm 9 이상

## pnpm 설치

아직 pnpm이 설치되어 있지 않다면:

```bash
npm install -g pnpm
```

## 프로젝트 클론

```bash
git clone https://github.com/yourusername/personal.git
cd personal
```

## 의존성 설치

모노레포의 모든 패키지 의존성을 한 번에 설치합니다:

```bash
pnpm install
```

pnpm 워크스페이스가 자동으로 모든 패키지의 의존성을 설치하고 링크합니다.

## 개발 서버 실행

### 플러그인만 실행

```bash
cd packages/plugin
pnpm dev
```

### 문서만 실행

```bash
cd packages/docs
pnpm dev
```

### 모든 패키지 동시 실행 (Turborepo)

```bash
pnpm dev
```

## 빌드

### 전체 빌드

```bash
pnpm build
```

### 특정 패키지만 빌드

```bash
cd packages/plugin
pnpm build
```

## 다음 단계

설치가 완료되었다면 [빠른 시작](/guide/quick-start) 가이드를 확인하세요.
