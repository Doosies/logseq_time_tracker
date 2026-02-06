# @personal/time-tracker

Time Tracker Logseq Plugin with React

Logseq용 시간 추적 플러그인입니다. React 19와 TypeScript로 작성되었으며, Vanilla Extract를 사용한 타입 안전한 스타일링을 지원합니다.

## 📋 목차

- [기능 소개](#기능-소개)
- [설치 방법](#설치-방법)
- [개발 가이드](#개발-가이드)
- [테스트](#테스트)
- [Logseq에 플러그인 로드](#logseq에-플러그인-로드)
- [프로젝트 구조](#프로젝트-구조)
- [기술 스택](#기술-스택)

## 🚀 기능 소개

- **시간 추적 UI**: Logseq 내에서 시간 추적을 위한 사용자 인터페이스 제공
- **툴바 통합**: Logseq 툴바에 버튼 추가
- **키보드 단축키**: `mod+shift+p`로 플러그인 UI 표시
- **명령어 팔레트**: `ctrl+shift+e`로 플러그인 UI 토글

## 📦 설치 방법

### 사전 요구사항

- Node.js 20 이상
- pnpm 9 이상
- Logseq (플러그인 로드용)

### 의존성 설치

```bash
# 모노레포 루트에서
pnpm install

# 또는 이 패키지 디렉토리에서
cd packages/time-tracker
pnpm install
```

## 🛠️ 개발 가이드

### 개발 서버 실행

```bash
pnpm dev
```

Vite 개발 서버가 시작되며, 파일 변경 시 자동으로 리로드됩니다.

### 빌드

```bash
pnpm build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 타입 체크

```bash
pnpm type-check
```

TypeScript 타입 오류를 확인합니다.

### 린트 & 포맷

```bash
# 린트 실행
pnpm lint

# 포맷 적용
pnpm format

# 포맷 체크
pnpm format:check
```

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# UI 모드로 실행 (브라우저 기반)
pnpm test:ui

# 커버리지 리포트 생성
pnpm test:coverage
```

### 테스트 구조

```
tests/
├── App.test.tsx        # App 컴포넌트 테스트
├── main.test.tsx       # main.tsx 통합 테스트
├── example.test.ts     # 예제 테스트
└── setup.ts            # 테스트 설정
```

## 📖 Logseq에 플러그인 로드

### 1. 플러그인 빌드

```bash
pnpm build
```

### 2. Logseq 설정

1. Logseq 실행
2. `Settings` → `Advanced` → `Developer mode` 활성화
3. `Plugins` → `Load unpacked plugin` 클릭
4. `packages/time-tracker` 디렉토리 선택

### 3. 플러그인 사용

- **툴바 버튼**: Logseq 툴바의 Time Tracker 아이콘 클릭
- **단축키**: `mod+shift+p` (Mac: `Cmd+Shift+P`, Windows/Linux: `Ctrl+Shift+P`)
- **명령어 팔레트**: `ctrl+shift+e`로 토글

## 🏗️ 프로젝트 구조

```
packages/time-tracker/
├── src/
│   ├── App.tsx              # 메인 React 컴포넌트
│   ├── App.css.ts           # App 컴포넌트 스타일 (Vanilla Extract)
│   ├── main.tsx             # 플러그인 진입점
│   ├── global.css.ts        # 전역 스타일
│   └── theme.css.ts         # 테마 스타일
├── tests/                   # 테스트 파일
│   ├── App.test.tsx
│   ├── main.test.tsx
│   ├── example.test.ts
│   └── setup.ts
├── docs/
│   └── CHANGELOG.md         # 변경 이력
├── index.html               # HTML 진입점
├── logo.svg                 # 플러그인 아이콘
├── package.json
├── tsconfig.json            # TypeScript 설정
└── vite.config.ts           # Vite 설정
```

### 주요 파일 설명

#### `src/main.tsx`
플러그인의 진입점입니다. Logseq API를 사용하여:
- 플러그인 초기화
- 툴바 버튼 등록
- 명령어 및 단축키 등록
- React 앱 렌더링

#### `src/App.tsx`
메인 React 컴포넌트입니다. 시간 추적 UI를 제공합니다.

#### `src/App.css.ts`
Vanilla Extract를 사용한 타입 안전한 CSS-in-TypeScript 스타일입니다.

## 🛠️ 기술 스택

### 핵심 라이브러리

- **React 19** - UI 프레임워크
- **TypeScript 5.9** - 타입 안전성
- **Vite 7.3** - 빌드 도구 및 개발 서버
- **@logseq/libs 0.0.17** - Logseq 플러그인 SDK

### 스타일링

- **Vanilla Extract** - 타입 안전한 CSS-in-TypeScript
  - 컴파일 타임 타입 체크
  - CSS-in-JS의 유연성과 CSS의 성능 결합
  - 테마 지원

### 테스트

- **Vitest 4.0** - 테스트 프레임워크
- **@testing-library/react** - React 컴포넌트 테스트
- **@testing-library/jest-dom** - DOM 매처
- **@vitest/ui** - 테스트 UI
- **@vitest/coverage-v8** - 커버리지 리포트

### 개발 도구

- **ESLint** - 코드 린팅
- **Prettier** - 코드 포맷팅
- **TypeScript ESLint** - TypeScript 린팅
- **vite-plugin-logseq** - Logseq 플러그인 빌드 지원

## 📝 라이센스

MIT

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요.

---

**버전**: 0.1.0  
**최종 업데이트**: 2026-02-06
