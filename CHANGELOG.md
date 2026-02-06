# Changelog


이 프로젝트의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.1.0] - 2026-02-06

### Added

- 모노레포 초기 구성
  - **[@personal/time-tracker](./packages/time-tracker)** (v0.1.0) - Logseq 플러그인
    - React 19 기반 UI 컴포넌트
    - Vanilla Extract 스타일링
    - Vitest 테스트 설정
    - Logseq SDK 통합
  - **[@personal/docs](./packages/docs)** (v0.1.0) - VitePress 문서화 사이트
    - 가이드 문서 구조
    - API 문서 구조
    - VitePress 1.6 설정
  - **[@personal/mcp-server](./packages/mcp-server)** (v0.1.0) - Cursor용 MCP 서버
    - MCP SDK 1.25 통합
    - get_current_time 도구
    - calculate 도구
    - info://server 리소스
  - **[@personal/ecount-dev-tool](./packages/ecount-dev-tool)** (v2.2.0) - Chrome 확장프로그램
    - Quick Login 기능
    - EC Server Manager (V5/V3 서버 전환)
    - Local Server Buttons
    - Stage Server Manager
- Turborepo 빌드 시스템 설정
- pnpm 워크스페이스 구성
- 공통 개발 도구 설정
  - TypeScript 5.9
  - ESLint & Prettier
  - Vitest (테스트 프레임워크)
