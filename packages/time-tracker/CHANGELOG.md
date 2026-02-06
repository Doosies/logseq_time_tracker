# Changelog

이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.1.0] - 2026-02-06

### Added

- 초기 플러그인 구조 설정
  - React 19 기반 UI 컴포넌트
  - TypeScript 5.9 설정
  - Vite 7.3 빌드 시스템
- Logseq 플러그인 통합
  - `@logseq/libs` SDK 통합
  - 툴바 버튼 등록
  - 명령어 및 단축키 등록 (`mod+shift+p`, `ctrl+shift+e`)
  - 명령어 팔레트 지원
- Vanilla Extract 스타일링
  - 타입 안전한 CSS-in-TypeScript
  - 테마 시스템 (`light_theme`)
  - 전역 스타일 설정
- Vitest 테스트 설정
  - React 컴포넌트 테스트 (`@testing-library/react`)
  - 통합 테스트 (`main.test.tsx`)
  - 커버리지 리포트 지원
- 개발 도구 설정
  - ESLint & Prettier
  - TypeScript ESLint
  - Vite 개발 서버
