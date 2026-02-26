# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [0.2.0] - 2026-02-26

### Changed

- 사이트 타이틀 "Personal Logseq Plugin" → "Personal Monorepo"로 변경
- VitePress 사이드바 재구성 (Getting Started, Development, References, UIKit API)
- Introduction: 5개 패키지 모노레포 소개로 전면 재작성
- Project Structure: uikit, ecount-dev-tool, mcp-server 패키지 구조 추가
- Installation: Storybook 실행, Chrome 확장프로그램 로드 과정 추가
- Quick Start: 패키지별 빠른 시작 가이드로 재작성
- Configuration: React JSX → Svelte 5, vanilla-extract, Storybook 설정으로 교체
- Testing: React Testing Library → Svelte Testing Library + Storybook play function으로 교체
- API Overview: Logseq SDK → uikit 컴포넌트 개요로 재작성
- API Components: uikit 11개 컴포넌트 (Simple 4개 + Compound 7개) API 문서 작성

### Added

- API Actions 문서 신규 작성 (clickOutside, blockDragFromInteractive)
- API Design Tokens 문서 신규 작성 (theme_vars, Light/Dark 테마)

### Removed

- API Hooks 문서 제거 (React → Svelte 전환으로 불필요)
- API Utils 문서 제거 (Design Tokens 문서로 대체)

## [0.1.0] - 2026-02-06

### Added

- (v0.1.0) - VitePress 문서화 사이트
    - 가이드 문서 구조
    - API 문서 구조
    - VitePress 1.6 설정
